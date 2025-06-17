FROM mysql:8.0

# Set environment variables
ENV MYSQL_ROOT_PASSWORD=rootpassword
ENV MYSQL_DATABASE=sqleditor
ENV MYSQL_USER=sqluser
ENV MYSQL_PASSWORD=sqlpassword

# Copy initialization scripts
COPY ./init.sql /docker-entrypoint-initdb.d/

# Expose port
EXPOSE 3306
