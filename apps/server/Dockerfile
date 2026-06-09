#build
FROM oven/bun:alpine AS builder
WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun build ./index.ts --compile --outfile server 



#runtime
FROM oven/bun:alpine
WORKDIR /app

COPY --from=builder /app/server ./server
RUN chmod +x ./server

EXPOSE 8080
CMD ["./server"]
