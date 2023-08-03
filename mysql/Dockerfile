FROM mysql:8.0

ENV MYSQL_ROOT_PASSWORD=root

ADD init.sql /docker-entrypoint-initdb.d

RUN chmod +r /docker-entrypoint-initdb.d/init.sql

EXPOSE 3306