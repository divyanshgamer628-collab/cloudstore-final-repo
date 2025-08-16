FROM alpine:latest

WORKDIR /app

COPY pocketbase /app/pocketbase
COPY pb_public /app/pb_public

EXPOSE 8090

CMD ["./pocketbase", "serve", "--http=0.0.0.0:8090"]