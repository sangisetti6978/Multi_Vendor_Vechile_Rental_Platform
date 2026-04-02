FROM maven:3.9.6-eclipse-temurin-21

WORKDIR /app

COPY . .

RUN mvn clean package -DskipTests

EXPOSE 8080

CMD ["/bin/sh", "-c", "DB_CONN=\"${DB_URL:-$DATABASE_URL}\"; if [ -n \"$DB_CONN\" ]; then case \"$DB_CONN\" in jdbc:postgresql://*) ;; postgres://*) DB_CONN=\"jdbc:postgresql://${DB_CONN#postgres://}\" ;; postgresql://*) DB_CONN=\"jdbc:postgresql://${DB_CONN#postgresql://}\" ;; esac; export DB_URL=\"$DB_CONN\"; fi; java -jar target/vehicle-rental-platform-1.0.0.jar"]