FROM node:16-alpine
COPY ./server.js /server.js
RUN echo "$(TEST_VALUE)" > /testValue.txt
CMD ["node", "server.js"]