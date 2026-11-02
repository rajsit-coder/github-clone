import { createContext } from "react";

// Plain JS file — holds the context object so the react-refresh
// rule doesn't complain about non-component exports in .jsx files.
const AuthContext = createContext();

export default AuthContext;
