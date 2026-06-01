# Build stage using Gradle image
FROM gradle:8.8-jdk17 AS build
COPY --chown=gradle:gradle . /home/gradle/src
WORKDIR /home/gradle/src
RUN gradle build -x test --no-daemon

# Runtime stage using Eclipse Temurin JRE image
FROM eclipse-temurin:17-jre
EXPOSE 8080
COPY --from=build /home/gradle/src/build/libs/*.jar app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]
