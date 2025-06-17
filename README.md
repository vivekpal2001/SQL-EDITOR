<<<<<<< HEAD
# SQL-EDITOR
=======
# SQL Table Editor with Real Database Integration

A comprehensive SQL table editor that connects to real MySQL and PostgreSQL databases running in Docker containers. Create tables, execute queries, and manage your database schema with an intuitive web interface.

## Features

- 🐳 **Docker Integration**: MySQL and PostgreSQL running in containers
- 🗃️ **Real Database Operations**: Create, query, and manage actual database tables
- 🔄 **Multi-Database Support**: Switch between MySQL and PostgreSQL
- 📊 **Visual Table Management**: View table schemas and sample data
- 💾 **Query History & Saved Queries**: Keep track of your SQL queries
- 🎯 **Smart Dummy Data**: Intelligent sample data generation
- 📤 **Schema Export**: Export database schemas as SQL files
- 🔍 **Real-time Validation**: SQL query validation and suggestions

## Quick Start

### 1. Clone and Setup

\`\`\`bash
git clone <repository-url>
cd sql-table-editor
npm install
\`\`\`

### 2. Environment Configuration

Copy the environment file and configure your settings:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Update `.env.local` with your database settings (defaults work with Docker setup):

\`\`\`env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=sqluser
MYSQL_PASSWORD=sqlpassword
MYSQL_DATABASE=sqleditor

POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=sqluser
POSTGRES_PASSWORD=sqlpassword
POSTGRES_DATABASE=sqleditor
\`\`\`

### 3. Start Database Containers

\`\`\`bash
# Start both MySQL and PostgreSQL containers
npm run docker:up

# Check container status
docker-compose ps

# View logs
npm run docker:logs
\`\`\`

### 4. Start the Application

\`\`\`bash
npm run dev
\`\`\`

Visit [http://localhost:3000](http://localhost:3000) to access the application.

## Docker Commands

\`\`\`bash
# Start containers
npm run docker:up

# Stop containers
npm run docker:down

# Restart containers
npm run docker:restart

# View logs
npm run docker:logs

# View specific service logs
docker-compose logs -f mysql
docker-compose logs -f postgres
\`\`\`

## Database Access

### MySQL
- **Host**: localhost
- **Port**: 3306
- **Database**: sqleditor
- **Username**: sqluser
- **Password**: sqlpassword

### PostgreSQL
- **Host**: localhost
- **Port**: 5432
- **Database**: sqleditor
- **Username**: sqluser
- **Password**: sqlpassword

## Project Structure

\`\`\`
sql-table-editor/
├── app/
│   ├── api/db/              # Database API routes
│   │   ├── status/          # Connection status
│   │   ├── create-table/    # Table creation
│   │   ├── execute-query/   # Query execution
│   │   ├── tables/          # Table listing
│   │   ├── delete-table/    # Table deletion
│   │   └── export-schema/   # Schema export
│   └── page.tsx             # Main page
├── components/              # React components
│   ├── sql-table-editor.tsx
│   ├── database-selector.tsx
│   ├── connection-status.tsx
│   ├── table-creator.tsx
│   ├── query-history-panel.tsx
│   ├── save-query-dialog.tsx
│   ├── query-result.tsx
│   └── table-view.tsx
├── lib/                     # Utility libraries
│   ├── db-connections.ts    # Database connection pools
│   ├── db-operations.ts     # Database operations
│   ├── sql-config.ts        # SQL dialect configurations
│   └── dummy-data-generator.ts
├── docker/                  # Docker configurations
│   ├── mysql/
│   │   ├── Dockerfile
│   │   └── init.sql
│   └── postgres/
│       ├── Dockerfile
│       └── init.sql
├── docker-compose.yml       # Docker services
└── package.json
\`\`\`

## Usage Guide

### 1. Creating Tables
1. Select your database dialect (MySQL/PostgreSQL)
2. Navigate to the "Create Tables" tab
3. Define your table name and columns
4. Add constraints and data types
5. Click "Create Table in Database"

### 2. Executing Queries
1. Go to the "Query Editor" tab
2. Write your SQL query
3. Click "Execute Query" to run against the selected database
4. View results in the results panel

### 3. Managing Tables
1. Visit the "View Tables" tab
2. See all tables in the selected database
3. View table schemas and sample data
4. Delete tables or generate queries

### 4. Query Management
- Save frequently used queries with custom names
- View query execution history
- Load previous queries for reuse

## Troubleshooting

### Database Connection Issues

1. **Check container status**:
   \`\`\`bash
   docker-compose ps
   \`\`\`

2. **Restart containers**:
   \`\`\`bash
   npm run docker:restart
   \`\`\`

3. **Check logs**:
   \`\`\`bash
   npm run docker:logs
   \`\`\`

### Port Conflicts

If ports 3306 or 5432 are already in use:

1. Stop existing services using those ports
2. Or modify the ports in `docker-compose.yml`:
   \`\`\`yaml
   ports:
     - "3307:3306"  # MySQL
     - "5433:5432"  # PostgreSQL
   \`\`\`
3. Update your `.env.local` accordingly

### Permission Issues

On Linux/macOS, you might need to adjust Docker permissions:

\`\`\`bash
sudo chown -R $USER:$USER .
\`\`\`

## Development

### Adding New Database Dialects

1. Update `lib/sql-config.ts` with new dialect configuration
2. Add connection logic in `lib/db-connections.ts`
3. Implement API routes for the new dialect
4. Update the UI components

### Extending Functionality

- Add new SQL functions and keywords in `sql-config.ts`
- Enhance dummy data patterns in `dummy-data-generator.ts`
- Create new API endpoints in `app/api/db/`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with both MySQL and PostgreSQL
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
>>>>>>> 850c23f (projectToGithub)
