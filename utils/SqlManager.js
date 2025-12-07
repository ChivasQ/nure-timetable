const fs = require('fs');
const path = require('path');
const { executeQuery } = require('../connection');

class SqlManager {
    constructor(sqlDir) {
        this.sqlDir = sqlDir;
        this.queries = {};
    }

    load() {
        console.log(`\x1b[34m[SQL]\x1b[0m\tLoading queries from path: ${this.sqlDir}`);
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

        const sql = content.replace(/^--\+PARAMS:.*$/m, '').trim();

        return async (argsObject = []) => {
            const paramArr = paramNames.map(name => argsObject[name]);
            return await executeQuery(sql, paramArr);
        }
    }
    
    async run(queryName, args) {
        if (!this.queries[queryName]) {
            throw new Error(`SQL query '${queryName}' not found.`);
        }
        return this.queries[queryName](args);
    }
}

const loader = new SqlManager(path.join(__dirname, '../queries'));
loader.load();

module.exports = loader;