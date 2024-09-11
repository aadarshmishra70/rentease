import { IconButton } from "@mui/material";
import { Search, Person, Menu } from "@mui/icons-material";
import variables from "../styles/variables.scss";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import "../styles/Navbar.scss";
import { Link, useNavigate } from "react-router-dom";
import { setLogout } from "../redux/state";
import toast from "react-hot-toast";  


const Navbar = () => {
  const [dropdownMenu, setDropdownMenu] = useState(false);

  const user = useSelector((state) => state.user);

  const dispatch = useDispatch();

  const [search, setSearch] = useState("")

  const navigate = useNavigate()

  const getImageUrl = () => {
    if (user.profileImagePath) {
      return `http://localhost:3001/${user.profileImagePath.replace("public", "")}`;
    } else if (user.picture) { // For Google sign-in users who might have a 'picture' URL
      return user.picture;
    } else {
      return "https://img.freepik.com/free-photo/cartoon-man-with-big-smile-his-shirt_1340-41430.jpg?t=st=1720468757~exp=1720472357~hmac=7b075f55d66f00606f768fb080dbed8c3a8d6295c20e6f58c83676b2eb653c43&w=740";
    }
  };

  return (
    <div className="navbar">
      <a href="/">
        <img src="/assets/logo.png" alt="logo" />
      </a>

      <div className="navbar_search">
        <input
          type="text"
          placeholder="Search ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <IconButton disabled={search === ""}>
          <Search
            sx={{ color: variables.pinkred }}
            onClick={() => { navigate(`/properties/search/${search}`) }}
          />
        </IconButton>
      </div>

      <div className="navbar_right">
        {user ? (
          <a href="/create-listing" className="host">
            Become A Host
          </a>
        ) : (
          <a href="/login" className="host">
            Become A Host
          </a>
        )}

        <button
          className="navbar_right_account"
          onClick={() => setDropdownMenu(!dropdownMenu)}
        >
          <Menu sx={{ color: variables.darkgrey }} />
          {!user ? (
            <Person sx={{ color: variables.darkgrey }} />
          ) : (
            <img
              src={getImageUrl()}
              alt={`${user.firstName} ${user.lastName}`}
              style={{ objectFit: "cover", borderRadius: "50%" }}
              onError={(e) => {
                e.target.onerror = null; // Prevents infinite loop if dummy image also fails to load
                e.target.src = "https://img.freepik.com/free-photo/cartoon-man-with-big-smile-his-shirt_1340-41430.jpg?t=st=1720468757~exp=1720472357~hmac=7b075f55d66f00606f768fb080dbed8c3a8d6295c20e6f58c83676b2eb653c43&w=740";
              }}
            />
          )}
        </button>

        {dropdownMenu && !user && (
          <div className="navbar_right_accountmenu">
            <Link to="/login">Log In</Link>
            <Link to="/register">Sign Up</Link>
          </div>
        )}

        {dropdownMenu && user && (
          <div className="navbar_right_accountmenu">
            <Link to={`/${user._id}/trips`}>Trip List</Link>
            <Link to={`/${user._id}/wishList`}>Wish List</Link>
            <Link to={`/${user._id}/properties`}>Property List</Link>
            <Link to={`/${user._id}/reservations`}>Reservation List</Link>
            <Link to="/create-listing">Become A Host</Link>

            <Link
              to="/login"
              onClick={() => {
                dispatch(setLogout());
                toast.success("Logged Out!")
              }}
            >
              Log Out
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;