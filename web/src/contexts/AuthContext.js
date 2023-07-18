import * as fcl from "@onflow/fcl";
import { createContext, useContext, useEffect, useState } from "react";
import { checkIsInitialized, IS_INITIALIZED } from "../flow/scripts";

export const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {

    // Create a state variable to keep track of the currentUser
    const [currentUser, setUser] = useState({
      loggedIn: false,
      addr: undefined,
    });
    // Create a state variable to represent if a user's account
    // has been initialized or not
    const [isInitialized, setIsInitialized] = useState(false);
  
    // Use FCL to subscribe to changes in the user (login, logout, etc)
    // Tell FCL to call `setUser` and update our state variables
    // if anything changes
    useEffect(() => fcl.currentUser.subscribe(setUser), []);
  
    // If currentUser is set, i.e. user is logged in
    // check whether their account is initialized or not
    useEffect(() => {
      if (currentUser.addr) {
        checkInit();
      }
    }, [currentUser]);
  
    // Helper function to log the user out of the dApp
    const logOut = async () => {
      fcl.unauthenticate();
      setUser({ loggedIn: false, addr: undefined });
    };
  
    // Helper function to log the user in to the dApp
    // p.s. this feels even easier than RainbowKit, eh?
    const logIn = () => {
      fcl.logIn();
    };
  
    // Use the `checkIsInitialized` script we wrote earlier
    // and update the state variable as necessary
    const checkInit = async () => {
      const isInit = await checkIsInitialized(currentUser.addr);
      setIsInitialized(isInit);
    };
  
    // Build the object of everything we want to expose through 
    // the context
    const value = {
      currentUser,
      isInitialized,
      checkInit,
      logOut,
      logIn,
    };
  
    // Return the Context Provider with the value set
    // Render all children of the component inside of it
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
  }