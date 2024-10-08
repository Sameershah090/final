FROM node:16-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]

export default function Component() {
  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Dockerfile</h1>
      <p className="mb-2">This Dockerfile sets up the container for the bot:</p>
      <ul className="list-disc pl-6 mb-4">
        <li>Uses Node.js 16 Alpine as the base image</li>
        <li>Sets the working directory to /app</li>
        <li>Copies package.json and installs dependencies</li>
        <li>Copies the rest of the application files</li>
        <li>Exposes port 3000</li>
        <li>Specifies the command to start the application</li>
      </ul>
    </div>
  );
}
