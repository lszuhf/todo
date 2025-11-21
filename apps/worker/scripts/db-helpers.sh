#!/bin/bash
# Database helper scripts for Cloudflare D1

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

DB_NAME="todo-db"

echo -e "${GREEN}Cloudflare D1 Database Helper Scripts${NC}\n"

# Function to show usage
show_usage() {
  echo "Usage: $0 [command] [options]"
  echo ""
  echo "Commands:"
  echo "  list-local          List local migrations"
  echo "  list-prod           List production migrations"
  echo "  apply-local         Apply local migrations"
  echo "  apply-prod          Apply production migrations"
  echo "  query-local [sql]   Execute SQL query on local database"
  echo "  query-prod [sql]    Execute SQL query on production database"
  echo "  create-local        Create local D1 database"
  echo "  create-prod         Create production D1 database"
  echo "  reset-local         Reset local database (drops and recreates)"
  echo ""
  echo "Examples:"
  echo "  $0 list-local"
  echo "  $0 apply-local"
  echo "  $0 query-local \"SELECT * FROM users\""
}

# Check if command is provided
if [ $# -eq 0 ]; then
  show_usage
  exit 1
fi

COMMAND=$1

case $COMMAND in
  list-local)
    echo -e "${YELLOW}Listing local migrations...${NC}"
    pnpm wrangler d1 migrations list $DB_NAME --local
    ;;
    
  list-prod)
    echo -e "${YELLOW}Listing production migrations...${NC}"
    pnpm wrangler d1 migrations list $DB_NAME
    ;;
    
  apply-local)
    echo -e "${YELLOW}Applying local migrations...${NC}"
    pnpm wrangler d1 migrations apply $DB_NAME --local
    ;;
    
  apply-prod)
    echo -e "${RED}⚠️  WARNING: This will apply migrations to PRODUCTION!${NC}"
    read -p "Are you sure? (yes/no): " confirm
    if [ "$confirm" == "yes" ]; then
      echo -e "${YELLOW}Applying production migrations...${NC}"
      pnpm wrangler d1 migrations apply $DB_NAME
    else
      echo -e "${GREEN}Cancelled.${NC}"
    fi
    ;;
    
  query-local)
    if [ -z "$2" ]; then
      echo -e "${RED}Error: SQL query required${NC}"
      echo "Usage: $0 query-local \"SELECT * FROM users\""
      exit 1
    fi
    echo -e "${YELLOW}Executing local query...${NC}"
    pnpm wrangler d1 execute $DB_NAME --local --command "$2"
    ;;
    
  query-prod)
    if [ -z "$2" ]; then
      echo -e "${RED}Error: SQL query required${NC}"
      echo "Usage: $0 query-prod \"SELECT * FROM users\""
      exit 1
    fi
    echo -e "${RED}⚠️  WARNING: Executing query on PRODUCTION!${NC}"
    read -p "Are you sure? (yes/no): " confirm
    if [ "$confirm" == "yes" ]; then
      echo -e "${YELLOW}Executing production query...${NC}"
      pnpm wrangler d1 execute $DB_NAME --command "$2"
    else
      echo -e "${GREEN}Cancelled.${NC}"
    fi
    ;;
    
  create-local)
    echo -e "${YELLOW}Creating local D1 database...${NC}"
    pnpm wrangler d1 create $DB_NAME --local
    ;;
    
  create-prod)
    echo -e "${RED}⚠️  WARNING: This will create a PRODUCTION database!${NC}"
    read -p "Are you sure? (yes/no): " confirm
    if [ "$confirm" == "yes" ]; then
      echo -e "${YELLOW}Creating production D1 database...${NC}"
      pnpm wrangler d1 create $DB_NAME
      echo -e "${GREEN}Database created! Update wrangler.toml with the database_id${NC}"
    else
      echo -e "${GREEN}Cancelled.${NC}"
    fi
    ;;
    
  reset-local)
    echo -e "${RED}⚠️  WARNING: This will delete and recreate the local database!${NC}"
    read -p "Are you sure? (yes/no): " confirm
    if [ "$confirm" == "yes" ]; then
      echo -e "${YELLOW}Resetting local database...${NC}"
      # Delete local database
      rm -rf .wrangler/state/v3/d1/miniflare-D1DatabaseObject
      echo -e "${GREEN}Local database reset. Run 'apply-local' to recreate tables.${NC}"
    else
      echo -e "${GREEN}Cancelled.${NC}"
    fi
    ;;
    
  *)
    echo -e "${RED}Error: Unknown command '$COMMAND'${NC}\n"
    show_usage
    exit 1
    ;;
esac
