import User from "../models/users.models.js"

export const getUserDetails = async (req, res) => {
    try {
        // console.log(req);
        // console.log("req. is "+JSON.stringify(req.user));
        // console.log("req.is "+JSON.stringify(req.user._id));
        
        const user = await User.findById(req.user._id); // Find user by ID extracted from the JWT token

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // console.log("user is "+user);
        

        // Return user details excluding password
        const { name, email, profilePhoto, subjects } = user;
        // console.log("user details",{ name, email, profilePhoto, subjects } );
        

        res.json({
            name,
            email,
            profilePhoto,
            subjects, 
        });
    } catch (error) {
        console.log("error is "+
        error);
        
        return res.status(500).json({ message: "Server error" });
    }
};


export const addQuestionsToSubject = async (req, res) => {
    try {
      const { user, questions, subjectName } = req.body; 


    //   console.log(req.body);
    //   console.log("id ",req.user._id);
    //   console.log("user is ",user);
      
    // req.user is beign added from middleware better to access it like req.user rather than destructring as it is causing undefined errors
    // console.log(req.user);
    
      const userId = req.user._id;
      if (!userId || !questions || !subjectName) {
        return res.status(400).json({ error: 'Missing required fields: user._id, questions, or subjectName' });
      }
  
      const updatedUser = await User.findOneAndUpdate(
        { _id: userId }, // Find the user by userId
        { 
          // Add new questions to the subject without removing previous ones
          $addToSet: { // Add only unique questions to the subject
            [`subjects.${subjectName}`]: { $each: questions }
          }
        },
        { new: true } 
      );
  
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      return res.status(200).json({ message: 'Questions added successfully', user: updatedUser });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  };