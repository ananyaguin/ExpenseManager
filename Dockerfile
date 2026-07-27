FROM eclipse-temurin:17-jre
WORKDIR /app
COPY target/expensemanager1-0.0.1-SNAPSHOT.jar expensemanager1-v1.0.jar
EXPOSE 9090
ENTRYPOINT ["java","-jar","expensemanager1-v1.0.jar"]


