import express from 'express';
import bodyParser from 'body-parser';
import mysql from 'mysql';
import cors from 'cors';
import dbConfig from './DbConfig.js'; 
import multer from 'multer';
import zlib from 'zlib';


// Configure multer for in-memory file storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 250 * 1024 * 1024 },
});
const app = express();
const port = 3003;


app.use(express.json({ limit: '250mb' })); 
app.use(express.urlencoded({ limit: '250mb', extended: true }));



// Middleware to parse JSON bodies
app.use(cors());
app.use(bodyParser.json());

// MySQL database connection
const db = mysql.createPool(dbConfig);

db.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database.');
  connection.release(); 
});




// get all tags
app.get("/api/articles/tags", (req, res) => {
  console.log('Fetching tags...');
  console.log('GET request received at /api/articles/tags');

  const getQuery = `
 SELECT DISTINCT t.tag 
  FROM kb_article_tags t
  INNER JOIN kb_articles a ON t.article_id = a.id
  WHERE a.deleted IS NULL;
`;

  db.query(getQuery, (error, results) => {
    if (error) {
      console.error('SQL error:', error);
      return res.status(500).json({ error: 'An error occurred while fetching the tags.' });
    }
    const tags = results.map(row => row.tag);
    res.status(200).json({ tags, status: 200 });
  });
});




// Route to get articles with details
app.get('/api/articles', (req, res) => {
  const query = `
    SELECT 
        a.id AS id,
        a.title,
        a.description,
        a.created_at,
        a.updated_at,
        a.author,
        a.deleted,
        COALESCE(
            (SELECT JSON_ARRAYAGG(tag) 
             FROM kb_article_tags t 
             WHERE t.article_id = a.id),
            JSON_ARRAY()
        ) AS tags,
        COALESCE(
            (SELECT JSON_ARRAYAGG(lang) 
             FROM kb_article_langs l 
             WHERE l.article_id = a.id),
            JSON_ARRAY()
        ) AS langs,
        COALESCE(
            (SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                    'name', f.filename,
                    'path', f.filepath,
                    'created_at', f.created_at,
                    'updated_at', f.updated_at
                )
            ) 
             FROM kb_article_files f 
             WHERE f.article_id = a.id),
            JSON_ARRAY()
        ) AS files
    FROM kb_articles a
    WHERE a.deleted IS NULL
    GROUP BY a.id;
  `;
  
  db.query(query, (error, results) => {
    if (error) {
      console.error('SQL error:', error);
      return res.status(500).json({ error: 'An error occurred while fetching data.' });
    }
    const formattedResults = results.map(article => ({
      ...article,
      tags: JSON.parse(article.tags || '[]'), 
      langs: JSON.parse(article.langs || '[]'),
      files: JSON.parse(article.files || '[]'),
    }));

    res.json(formattedResults);
  });
});





// Route to get articles with details : ID
app.get('/api/articles/:id', (req, res) => {
  const articleId = req.params.id;

  const query = `
    SELECT 
        a.id AS id,
        a.title,
        a.description,
        a.created_at,
        a.updated_at,
        a.author,
        a.deleted,
        COALESCE(
            (SELECT JSON_ARRAYAGG(tag) 
             FROM kb_article_tags t 
             WHERE t.article_id = a.id),
            JSON_ARRAY()
        ) AS tags,
        COALESCE(
            (SELECT JSON_ARRAYAGG(lang) 
             FROM kb_article_langs l 
             WHERE l.article_id = a.id),
            JSON_ARRAY()
        ) AS langs,
        COALESCE(
            (SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                    'file_server_id', f.file_server_id,
                    'name', f.filename,
                    'path', f.filepath,
                    'created_at', f.created_at,
                    'updated_at', f.updated_at
                )
            ) 
             FROM kb_article_files f 
             WHERE f.article_id = a.id),
            JSON_ARRAY()
        ) AS files
    FROM kb_articles a
    WHERE a.deleted IS NULL AND a.id = ?
    GROUP BY a.id;
  `;
  
  db.query(query, [articleId], (error, results) => {
    if (error) {
      console.error('SQL error:', error);
      return res.status(500).json({ error: 'An error occurred while fetching data.' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Article not found.' });
    }

    const article = results[0];
    const formattedResults = {
      ...article,
      tags: JSON.parse(article.tags || '[]'), 
      langs: JSON.parse(article.langs || '[]'),
      files: JSON.parse(article.files || '[]'),
    };

    res.json(formattedResults);
  });
});



// Route to add a new article
app.post('/api/articles', upload.array('files'), (req, res) => {
  console.log("req.body ", req.body);
  const { title, description, author, tags, langs } = req.body;
  const files = req.body.files;
  console.log('Files received:', files); 

  if (!title || !description || !tags || !langs) {
    return res.status(400).json({ error: 'Title, description, tags and files are required.' });
  }

  const tagsArray = tags ? tags.split(',').map(tag => tag.trim()) : [];
  const langsArray = langs ? langs.split(',').map(lang => lang.trim()) : [];

  const insertArticleQuery = `
    INSERT INTO kb_articles (title, description, author, created_at)
    VALUES (?, ?, ?, NOW());
  `;
  
  db.query(insertArticleQuery, [title, description, author], (error, results) => {
    if (error) {
      console.error('SQL error:', error); 
      return res.status(500).json({ error: 'An error occurred while adding the article.' });
    }

    const articleId = results.insertId; 

    // Insert tags
    if (tagsArray.length > 0) {
      const insertTagsQuery = 'INSERT INTO kb_article_tags (article_id, tag) VALUES ?';
      const tagsValues = tagsArray.map(tag => [articleId, tag]);
      db.query(insertTagsQuery, [tagsValues], (error) => {
        if (error) {
          console.error('SQL error:', error); 
          return res.status(500).json({ error: 'An error occurred while adding tags.' });
        }
      });
    }

      // Insert languages
      if (langsArray.length > 0) {
        const insertLangsQuery = 'INSERT INTO kb_article_langs (article_id, lang) VALUES ?';
        const langsValues = langsArray.map(lang => [articleId, lang]);
        db.query(insertLangsQuery, [langsValues], (error) => {
          if (error) {
            console.error('SQL error:', error);
            return res.status(500).json({ error: 'An error occurred while adding languages.' });
          }
        });
      }

      // Insert files
      if (files){
        // Ensure files is an array even if only one file
        const filesArray = Array.isArray(files) ? files : [files];
        const parsedFiles = filesArray.map(file => JSON.parse(file));
        if (parsedFiles && parsedFiles.length > 0) { 
        const insertFilesQuery = 'INSERT INTO kb_article_files (article_id, file_server_id, filename, created_at) VALUES ?';
        const filesValues = parsedFiles.map(file => [articleId, file.id, file.name, new Date()]);
        db.query(insertFilesQuery, [filesValues], (error) => {
          if (error) {
            console.error('SQL error:', error); 
            return res.status(500).json({ error: 'An error occurred while adding files.' });
          }
        });
      }
    }

    res.status(201).json({ message: 'Article added successfully.', articleId });
  });
});




// Route to update an article
app.put("/api/articles/:id", upload.array('uploadedFiles'), async (req, res) => {
  const { title, description, tags, langs, deletedFiles, uploadedFiles } = req.body;
  const articleId = req.params.id;
   
  // parse deleted files
   const parsedDeletedFiles = JSON.parse(deletedFiles || '[]'); 

  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required.' });
  }

  try {
    // Update the article
    const updateArticleQuery = `
      UPDATE kb_articles 
      SET title = ?, description = ?, updated_at = NOW() 
      WHERE id = ?;
    `;
    await executeQuery(updateArticleQuery, [title, description, articleId]);

    // Handle tags
    await updateTags(articleId, tags);

    // Handle langs
    const langsArray = JSON.parse(langs);
    await updateLangs(articleId, langsArray);

    // Handle deleted files
    if (parsedDeletedFiles.length > 0) {
      await deleteFiles(articleId, parsedDeletedFiles);
    }
    // Handle uploaded files
    if (uploadedFiles && uploadedFiles.length > 0) {
         // parse added files
        const filesArray = Array.isArray(uploadedFiles) ? uploadedFiles : [uploadedFiles];
        const parsedFiles = filesArray.map(file => JSON.parse(file));
        
        const result = await addFiles(articleId, parsedFiles);
      if (result.error) {
        // Send error message for duplicates
        return res.status(400).json({ error: result.error });
      } 
    }
    // Success response
    res.status(200).json({ message: 'Article, tags, and langs updated successfully.', status: 200 });
  } catch (error) {
      console.error('Error updating article:', error);  
      res.status(500).json({ error: 'An error occurred while updating the article.' });
  }
});
// Function to delete files
const deleteFiles = async (articleId, deletedFiles) => {
  if (deletedFiles.length === 0) {
    console.log("No files to delete.");
    return;
  }
  // Generate the correct number of placeholders for the SQL query
  const placeholders = deletedFiles.map(() => '?').join(',');
  const deleteFilesQuery = `DELETE FROM kb_article_files WHERE article_id = ? AND filename IN (${placeholders})`;

  try {
    await executeQuery(deleteFilesQuery, [articleId, ...deletedFiles]);
  } catch (error) {
    console.error('SQL error:', error);
    throw new Error('An error occurred while deleting files.');
  }
};
// Function to add new files
const addFiles = async (articleId, uploadedFiles) => {
  const filenames = uploadedFiles.map(file => file.originalname);
  // Query to check for existing filenames
  const placeholders = filenames.map(() => '?').join(',');
  const checkExistingFilesQuery = `SELECT filename FROM kb_article_files WHERE article_id = ? AND filename IN (${placeholders})`;
  try {
    // Check for existing filenames
    const existingFiles = await executeQuery(checkExistingFilesQuery, [articleId, ...filenames]);
    const existingFilenames = existingFiles.map(file => file.filename);
    console.log("existingFilenames", existingFilenames);

    // Find duplicates
    const duplicates = filenames.filter(filename => existingFilenames.includes(filename));
    console.log("duplicates", duplicates);
    if (existingFiles.length > 0 && duplicates.length > 0) {
      return { status: 502, error: `Files already exists: ${duplicates.join(', ')}` };
    }

    // Prepare data for insertion
    const insertFilesQuery = 'INSERT INTO kb_article_files (article_id, file_server_id, filename, created_at) VALUES ?';
    const fileValues = uploadedFiles.map(file => [articleId, file.id, file.name, new Date()]);

    // Insert new files
    await executeQuery(insertFilesQuery, [fileValues]);
    return { status: 200, message: 'Files added successfully.' };
  } catch (error) {
    console.error('Error in addFiles:', error);
    throw new Error('An error occurred while adding files.');
  }
};
// Helper function to execute database queries
const executeQuery = (query, params) => {
  return new Promise((resolve, reject) => {
    db.query(query, params, (error, results) => {
      if (error) {
        console.error('SQL error:', error);
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};
// Function to update tags
const updateTags = async (articleId, tags) => {
  const tagsArray = tags.split(',').map(tag => tag.trim());
  const deleteTagsQuery = 'DELETE FROM kb_article_tags WHERE article_id = ?';
  await executeQuery(deleteTagsQuery, [articleId]);

  if (tagsArray.length > 0) {
    const insertTagsQuery = 'INSERT INTO kb_article_tags (article_id, tag) VALUES ?';
    const tagsData = tagsArray.map(tag => [articleId, tag]);
    await executeQuery(insertTagsQuery, [tagsData]);
  }
};
// Function to update langs
const updateLangs = async (articleId, langs) => {
  const deleteLangsQuery = 'DELETE FROM kb_article_langs WHERE article_id = ?';
  await executeQuery(deleteLangsQuery, [articleId]);

  if (Array.isArray(langs) && langs.length > 0) { 
    const insertLangsQuery = 'INSERT INTO kb_article_langs (article_id, lang) VALUES ?';
    const langsData = langs.map(lang => [articleId, lang]);
    await executeQuery(insertLangsQuery, [langsData]);
  }
};



//Route delete
app.delete('/api/articles/:id', (req, res) => {
  const articleId = parseInt(req.params.id, 10);

  if (isNaN(articleId)) {
    return res.status(400).json({ error: 'Invalid article ID.' });
  }

  const updateArticleQuery = 'UPDATE kb_articles SET deleted = NOW() WHERE id = ?';

  db.query(updateArticleQuery, [articleId], (error) => {
    if (error) {
      console.error('SQL error:', error);
      return res.status(500).json({ error: 'An error occurred while deleteing (updating deleted column to NOW) the article.' });
    }
    res.status(200).json({ message: 'Article marked as deleted successfully.', status: 200 });
  });
});






// RECENT SHOT - get all qms-data 
app.get("/api/qms/data", (req, res) => {
  console.log("GET request received at /api/qms/data");

  const activity_uuids = req.query.activity_uuids;
  console.log("activity_uuids array: ", activity_uuids)

  if (!activity_uuids || activity_uuids.length === 0) {
    return res.status(400).json({ error: "Missing activity_uuids parameter." });
  }

  const uuidArray = activity_uuids.split(","); 
  console.log("activity_uuids", uuidArray);

  const placeholders = uuidArray.map(() => "?").join(","); 
  const getQuery = `
    SELECT q.*, r.activity_uuid, p.statuses AS admin_statuses, p.comments AS admin_comments
    FROM pms_retouchers_qms q
    JOIN pms_retouchers r ON q.retoucher_id = r.id
    LEFT JOIN pms_admin_qms p ON r.activity_uuid = p.activity_uuid
    WHERE r.activity_uuid IN (${placeholders})
  `;

  db.query(getQuery, uuidArray, (error, results) => {
    if (error) {
      console.error("SQL error:", error);
      return res.status(500).json({ error: "An error occurred while fetching qms-data." });
    }
    if (results.length === 0) {
      console.log("No qms-data found");
      return res.status(404).json({ status: 404, error: "Qms-data not found." });
    }
    res.status(200).json({ qmsData: results, status: 200 });
  });
});





app.listen(port, () =>{
    console.log(`Server is running on port ${port}`);
})