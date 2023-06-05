const express = require('express');
const fetchuser =require('../middleware/fetchuser')
const router=express.Router()
const cors=require('cors');
router.use(cors());
const Notes = require('../models/Notes')
const { body, validationResult } = require('express-validator');
router.use(express.json());
router.get('/getallnotes',fetchuser,async(req,res)=>{
const notes=await Notes.find({user:req.user.id})
res.status(200).json(notes)
})
router.post('/addNotes',fetchuser,
    //express validator are used to validate the fields
    body('title', "name should have minimum length is 5").isLength({ min: 5 }),
    body('description', 'password should minimum length is 5').isLength({ min: 5 }),
    body('tag', "name should have minimum length is 5").isLength({ min: 5 }),

     async (req, res) => {
         
         
         //if any error occur while entering the data in the fields like if length of the name is less than 5 or etc
         const errors = validationResult(req);
         if (!errors.isEmpty()) {
             return res.status(400).json({ errors: errors.array() });
            }
            try {
        const user =await  Notes.create({
            title: req.body.title,
            description: req.body.description,
            tag:req.body.tag,
            user:req.user.id
        });
        await user.save()
        .then(async (item) => {
            return res.send(item)
        .catch(err => {
                return res.status(400).send("unable to save to database");
        });
        })
    } catch (error) {
            console.log("Internal server error occured")
    }
        //generating the authtoken that is used for secure communication between client and database
      
    });

    router.put('/updateNotes/:id',fetchuser,async(req,res)=>{
        try {
            
       
        const {title,description,tag}=req.body;
        const newNote={}
        if(title){
            newNote.title=title;
        }
        if(description){
            newNote.description=description;
        }
        if(tag){
            newNote.tag=tag;
        }
        let note=await Notes.findById(req.params.id);
        if(!note){
            return res.status(404).json ("Not found");
        }
        if(note.user.toString()!==req.user.id){
            return res.status(401).json ("Not allowed");
        }
        note=await Notes.findByIdAndUpdate(req.params.id,{$set:newNote},{new:true});
        res.json(note);
    } catch (error) {
            console.log("internal server error occured")
    }
    })
    router.delete('/deleteNotes/:id', fetchuser, async (req, res) => {
        try {
          const note = await Notes.findById(req.params.id);
          if (!note) {
            return res.status(404).json("Note not found");
          }
          if (note.user.toString() !== req.user.id) {
            return res.status(401).json("Not allowed");
          }
          await Notes.findByIdAndDelete(req.params.id);
          res.json({ message: "Note deleted successfully" });
        } catch (error) {
         console.log("internal server error occured")
        }
      });
      
module.exports=router;