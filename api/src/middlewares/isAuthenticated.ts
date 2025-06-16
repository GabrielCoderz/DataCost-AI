import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";

interface Payload {
    sub: string;
}

export function isAuthenticated(
    request: Request,
    response: Response,
    next: NextFunction,
) {
    const authToken = request.headers.authorization;

    if(!authToken) {
        throw new Error('É necessário o token.');
    }

    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET não definida no .env');
    }
      
    const [, token] = authToken.split(" ");

    try {
        const { sub } = verify(
            token,
            process.env.JWT_SECRET
        ) as Payload;

        request.user_id = sub;

        next();

    } catch(err) {
        response.status(401).end()
    }
}