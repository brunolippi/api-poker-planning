import { Router } from "express";

const router = Router();

router.get('/', (req, res) => {
    res.send('Well done!');
})

export { router }