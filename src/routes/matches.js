import express, {router} from 'express';

export  const matchRouter = express.Router();

matchRouter.get('/', (req, res) => {
    res.status(200).json({
        message: 'matches List',
    })
    }
)