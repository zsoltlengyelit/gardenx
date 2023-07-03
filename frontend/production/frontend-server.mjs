import http from "node:http";
import fs from "node:fs";
import path from "node:path";

function serverRawFile(response, contentType, fileName, filePath) {
    fs.readFile(filePath, function (error, content) {
        if (error) {
            if (error.code == 'ENOENT') {
                response.writeHead(404, {'Content-Type': 'text/html'});
                response.end();
            } else {
                response.writeHead(500);
                response.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
                response.end();
            }
        } else {
            response.writeHead(200, {
                'Content-Type': contentType,
                'Last-Modified': 'Thu, 04 Feb 2021 18:22:39 GMT',
                'ETag': fileName,
                'Accept-Ranges': 'bytes',
                'Cache-Control': 'public, immutable'
            });
            response.end(content, 'utf-8');
        }
    });
}

async function frontendServer() {
    const baseDir = process.argv.slice(2)[0];

    console.log(`Serving content from ${baseDir}`);

    const port = process.env.PORT || 80;
    http.createServer(function (request, response) {

        let fileName = '.' + request.url;
        if (fileName == './')
            fileName = './index.html';

        const extname = path.extname(fileName);
        let contentType = 'text/html';
        switch (extname) {
            case '.js':
                contentType = 'text/javascript';
                break;
            case '.css':
                contentType = 'text/css';
                break;
            case '.json':
                contentType = 'application/json';
                break;
            case '.png':
                contentType = 'image/png';
                break;
            case '.jpg':
                contentType = 'image/jpg';
                break;
            case '.wav':
                contentType = 'audio/wav';
                break;
        }

        const filePath = path.join(baseDir, fileName);

        console.log(`Serving: ${filePath}`);

        fs.readFile(`${filePath}.gz`, function (brotliError, brotliContent) {
            if (brotliError) {
                if (brotliError.code == 'ENOENT') {
                    console.log(`Gzip file not found, fallback to ${filePath}`);
                    serverRawFile(response, contentType, fileName, filePath)
                } else {
                    response.writeHead(500);
                    response.end('Sorry, check with the site admin for error: ' + brotliError.code + ' ..\n');
                    response.end();
                }
            } else {
                console.log(`Gzip file found: ${filePath}.gz`);
                response.writeHead(200, {
                    'Content-Type': contentType,
                    'Content-Encoding': 'gzip',
                    'Last-Modified': 'Thu, 04 Feb 2021 18:22:39 GMT',
                    'ETag': fileName,
                    'Accept-Ranges': 'bytes',
                    'Cache-Control': 'public, immutable'
                });
                response.end(brotliContent, 'utf-8');
            }
        });


    }).listen(port, '0.0.0.0');

    console.log(`Server running at http://0.0.0.0:${port}/`);
}

await frontendServer();