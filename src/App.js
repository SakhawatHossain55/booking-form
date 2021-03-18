import './App.css';
import firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './Firebase.config';
import { useState } from 'react';

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app(); // if already initialized, use that one
}

function App() {
  const [newUser, setNewUser] = useState(false)
  const [user, setUser] = useState({
    isSignedIn: false,
    name : '', 
    email : '',
    photo : '',
    password : '',
  })

  const provider = new firebase.auth.GoogleAuthProvider();

  const handleSignIn = () => {
    firebase.auth()
  .signInWithPopup(provider)
  .then( result => {
   var credential = result.credential;
    var token = credential.accessToken;
    // console.log(result);
    const {displayName, email, photoURL} = result.user;
    const signedInUser ={
      isSignedIn: true,
      name: displayName, 
      email: email,
      photo: photoURL,
    }
    setUser(signedInUser)
    console.log(displayName, email, photoURL);
  }).catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;
    var email = error.email;
    var credential = error.credential;
    console.log(error.errorMessage);
  });
  }
  const handleSignOut = () => {
    firebase.auth().signOut().then(res => {
      const signedOutUser = {
        isSignedIn: false,
        name: '',
        photo: '',
        email: '',
        error: '',
        success: false
      }
      setUser(signedOutUser);
      console.log(res);
    }).catch((error) => {
      // An error happened.
    });
  }
  const handleBlur = (e) => {
    let isFormValid = true;
    if(e.target.name === 'email'){
      isFormValid = /\S+@\S+\.\S+/.test(e.target.value);
      // console.log(isEmailValid);
    }
    if(e.target.name === 'password'){
      const isPasswordValid = e.target.value.length > 6;
      const passwordHasNumber = /\d{1}/.test(e.target.value);
      isFormValid = isPasswordValid && passwordHasNumber;
    }
    if(isFormValid){
      const newUserInfo = {...user};
      newUserInfo[e.target.name] = e.target.value;
      setUser(newUserInfo)
    }
  }
  const handleSubmit = (e) => {
    if(newUser && user.email && user.password){
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
    .then((res) => {
    const newUserInfo = {...user};
    newUserInfo.error = '';
    newUserInfo.success = true;
    setUser(newUserInfo);
    updateUserName(user.name);
  })
  .catch((error) => {
    const newUserInfo = {...user};
    newUserInfo.error = error.message;
    newUserInfo.success  = false;
    setUser(newUserInfo);
  });
    }

    if(!newUser && user.email && user.password){
      firebase.auth().signInWithEmailAndPassword(user.email, user.password)
  .then((res) => {
    const newUserInfo = {...user};
    newUserInfo.error = '';
    newUserInfo.success = true;
    setUser(newUserInfo);
    console.log('sign in user info', res.user);
    
  })
  .catch((error) => {
    const newUserInfo = {...user};
    newUserInfo.error = error.message;
    newUserInfo.success  = false;
    setUser(newUserInfo);
  });
    }

    e.preventDefault();
  }
  const updateUserName = name => {
    const user = firebase.auth().currentUser;

    user.updateProfile({
      displayName: name,
      }).then(function() {
        console.log('user name updated successfully');
    }).catch(function(error) {
      console.log(error);
    });
  }

  return (
    <div className="App">
      {
        user.isSignedIn && <div>
          <p>Welcome, {user.name}</p>
          <p>Your email : {user.email}</p>
          <img src={user.photo} alt=""/>
        </div>
      }
      {
        user.isSignedIn ? <button onClick={handleSignOut}>Sign Out</button> :
        <button onClick={handleSignIn}>Sign in</button>
      }

      <h3>Our own Authentication</h3>
          <input type="checkbox" onChange={() => setNewUser(!newUser)} name="newUser" id=""/>
          <label htmlFor="newUser">New User Sign Up</label>

        <form onSubmit={handleSubmit}>
          {newUser && <input name="name" type="text" onBlur={handleBlur} placeholder="Your Name"/>}
          <br/>
          <input type="email" onBlur={handleBlur} name="email" placeholder="Email" required id=""/>
          <br/>
          <input type="password" onBlur={handleBlur} name="password" placeholder="Password" required id=""/>
          <br/>
          <input type="submit" value={newUser ? 'Sign Up' : 'Sign In'}/>
        </form>
         <p style={{color: 'red'}}>{user.error}</p>
         {user.success && <p style={{color: 'green'}}>User {newUser ? 'Create' : 'Logged In'} a Successfully</p>}
      </div>
  );
}

export default App;
