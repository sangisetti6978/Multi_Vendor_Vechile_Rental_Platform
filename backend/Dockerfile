FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY . .

RUN apt-get update && apt-get install -y maven

# 🔥 SHOW BUILD OUTPUT (IMPORTANT)
RUN mvn clean package -DskipTests

# 🔍 DEBUG: LIST FILES
RUN ls -R target

EXPOSE 8080

CMD ["sh", "-c", "java -jar target/*.jar"]