import express, { Router } from "express";
import cors from "cors";
import { router } from './routes';
// import { errorHandler } from "./middlewares/errorHandler";
// import setupSwagger from "./config/swagger";

const app = express();

app.use(cors());
app.use(express.json());
app.use(router);
app.use(express.urlencoded({ extended: true }));
// app.use(errorHandler);

// setupSwagger(app)

export const PORT = 3333

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Documentação disponível em http://localhost:${PORT}/api/v1/docs`)
});