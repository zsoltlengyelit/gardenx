import http from "node:http";
import fs from "node:fs";
import path from "node:path";

async function frontendServer() {
    const baseDir = process.argv.slice(2)[0];

    console.log(`Serving content from ${baseDir}`);

    const port = process.env.PORT || 80;
    http.createServer(function (request, response) {
        console.log('request starting...');

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
        fs.readFile(filePath, function (error, content) {
            if (error) {
                if (error.code == 'ENOENT') {
                    fs.readFile('./404.html', function (error, content) {
                        response.writeHead(200, {'Content-Type': contentType});
                        response.end(content, 'utf-8');
                    });
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

    }).listen(port, '0.0.0.0');

    console.log(`Server running at http://0.0.0.0:${port}/`);
}

await frontendServer();