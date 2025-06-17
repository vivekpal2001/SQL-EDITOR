FROM postgres:15

# Set environment variables
ENV POSTGRES_DB=sqleditor
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=rootpassword

# Copy initialization scripts
COPY ./init.sql /docker-entrypoint-initdb.d/01-init.sql

# Set proper permissions
RUN chmod 644 /docker-entrypoint-initdb.d/01-init.sql

# Expose port
EXPOSE 5432
