import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Modal from "react-modal"
import Home from "./pages/Home/Home"
import Login from "./pages/Login/Login"
import SignUp from "./pages/signup/SignUp"

Modal.setAppElement("#root")

const routes = [
  <Router>
    <Routes>
      <Route path="/dashboard" exact element={<Home />} />
      <Route path="/login" exact element={<Login />} />
      <Route path="/signUp" exact element={<SignUp />} />
    </Routes>
  </Router>
]

function App() {

  return (
    <>
      {routes}
    </>
  )
}

export default App
