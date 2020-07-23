
import express from 'express';
import ui from "@restroom-mw/ui";

const router = express.Router({mergeParams: true});

router.post('/register', (req, res) => {
    //Lets validate the data before we add a user

})

export default router;