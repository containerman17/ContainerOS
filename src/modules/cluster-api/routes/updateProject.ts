// import express from 'express';
// import database from "../../../lib/database"
// import { create } from 'superstruct'
// import { updateProject } from "../validators"


// export default async function (req: express.Request, res: express.Response) {
//     const validatedBody = create(req.body, updateProject)

//     await database.safePatch(`projects/${validatedBody.name}`, (oldOne): object => {
//         return Object.assign({}, oldOne, validatedBody)
//     })

//     return res.send({
//         success: true
//     })
// }
