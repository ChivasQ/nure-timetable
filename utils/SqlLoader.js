const fs = require('fs');
const path = require('path');
const { executeQuery } = require('../connection');

class SqlLoader {
    constructor(sqlDir) {
        this.sqlDir = sqlDir;
        this.queries = {};
    }

    load() {
        const files = fs.readdirSync(this.sqlDir);

        files.forEach(file => {
            if (path.extname(file) === '.sql') {
                const queryName = path.basename(file, '.sql');
                const filePath = path.join(this.sqlDir, file);
                const content = fs.readFileSync(filePath, 'utf8');

                this.queries[queryName] = this._createQueryFunction(content);
                console.log(`\x1b[34m[SQL]\x1b[0m\tQuery loaded: ${queryName}`);
            }
        });
    }

    _createQueryFunction(content) {
        const paramMatch = content.match(/^--\+PARAMS:\s*(.+)$/m);
        const paramNames = paramMatch ? paramMatch[1].trim().split(/\s+/) : [];

    }

}

const loader = new SqlLoader(path.join(__dirname, '../queries'));
loader.load();

module.exports = loader;