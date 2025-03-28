import { MenuContext } from "../../context/MenuContext";
import { ChangeEvent, FormEvent, useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthorizationContext";
import { baseUrl } from "../../utilities/urls";
import {
  ImageUploadOkResponse,
  NewSunset,
  UpdateOkResponse,
  UpdateUser,
} from "../../types/customTypes";
import {
  deleteProfileApi,
  getUserSunsetsApi,
  updateProfileApi,
} from "../../api/authorisation";
import { NavLink, useNavigate } from "react-router";
import {
  Alert,
  Card,
  CardContent,
  CardMedia,
  Snackbar,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import "./Profile.css";

function Profile() {
  //   location.reload();
  // return false;

  // function refresh() {
  //   setTimeout(function () {
  //     location.reload();
  //   }, 100);
  // }
  // refresh();
  const { isMenuOpen, setIsMenuOpen } = useContext(MenuContext);
  const { loggedUser, getUserProfile, updateUser, isAuthenticated } =
    useContext(AuthContext);
  //const [loading, setLoading] = useState(true);

  const [openSnackbar, setOpenSnackbar] = useState(false); // Zustand für Snackbar
  const [snackbarMessage, setSnackbarMessage] = useState(""); // Nachricht für Snackbar
  const navigate = useNavigate();

  // useEffect zum Laden der Benutzerdaten
  // useEffect(() => {
  //   if (!loggedUser) {
  //     // Lade Benutzerdaten, wenn sie nicht vorhanden sind
  //     getUserProfile().finally(() => setLoading(false)); // Setzt loading auf false nach erfolgreichem Laden
  //   } else {
  //     setLoading(false); // Wenn loggedUser bereits existiert, setze loading auf false
  //   }
  // }, [loggedUser, getUserProfile]);

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  const [loginError, setLoginError] = useState<Error | null>(null);
  //console.log('loggedUser :>> ', loggedUser);
  // console.log('result.user :>> ', result.user)

  useEffect(() => {
    if (loggedUser === null) {
      getUserProfile();
    }
  }, [loggedUser, getUserProfile]);
  // REVIEW why putting getUserProfile in the dependency array? what behaviour would you expect with it?

  // IMAGE UPLOAD - KANN ICH DAS IN EINE CONTEXT PACKEN??
  const [selectedFile, setSelectedFile] = useState<File | string>("");
  const handleAttachFile = (e: ChangeEvent<HTMLInputElement>) => {
    console.log("e.target :>> ", e);
    const file = e.target.files?.[0];
    if (file instanceof File) {
      console.log("Selected File set");
      setSelectedFile(file);
    }
  };
  const handleImageUpload = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("selectedFile :>> ", selectedFile);
    // Code from Postman for the Image Upload
    const formdata = new FormData();
    formdata.append("image", selectedFile);

    const requestOptions = {
      method: "POST",
      body: formdata,
    };

    try {
      const response = await fetch(
        // `${baseUrl}/api/users/uploadImage`,
        `${baseUrl}/api/image/upload`,
        requestOptions
      );

      const result = (await response.json()) as ImageUploadOkResponse;
      const userUpdate = {
        ...loggedUser!,
        img: result.imgUrl,
        username: result.username,
        //new
      };

      await updateProfileApi(userUpdate);
      updateUser(userUpdate);

      console.log("result :>> ", result, loggedUser);
    } catch (error) {
      console.log("error :>> ", error);
    }
  };

  // CHANGE USERNAME
  // const [newUsername, setNewUsername] = useState<string>(
  //   loggedUser?.username || ""
  // );

  // const handleUsernameChange = async (e: FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();

  //   const formdata = new FormData(e.target as HTMLFormElement);
  //   const userNameUpdate: string =
  //     (formdata.get("newUsername") as string) || loggedUser?.username;

  //   await updateProfileApi({
  //     id: loggedUser.id,
  //     img: loggedUser.img,
  //     email: loggedUser.email,
  //     username: userNameUpdate,
  //   });

  //   updateUser({
  //     ...loggedUser,
  //     username: userNameUpdate,
  //   });
  // };

  // CHANGE Email
  // const [newEmail, setNewEmail] = useState<string>(loggedUser?.password || "");

  // const handleEmailChange = async (e: FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();

  //   const formdata = new FormData(e.target as HTMLFormElement);
  //   const emailUpdate: string =
  //     (formdata.get("newEmail") as string) || loggedUser?.email;

  //   await updateProfileApi({
  //     id: loggedUser.id,
  //     img: loggedUser.img,
  //     username: loggedUser.username,
  //     email: emailUpdate,
  //   });

  //   updateUser({
  //     ...loggedUser,
  //     email: emailUpdate,
  //   });
  // };

  {
    /* CHANGE USERNAME & EMAIL  */
  }
  const [newUsername, setNewUsername] = useState<string>(
    loggedUser?.username || ""
  );

  // const handleEmailChange = async (newEmail: string) => {
  //   // Prüfen, ob die neue E-Mail mit der aktuellen E-Mail des Nutzers übereinstimmt
  //   if (newEmail === loggedUser.email) {
  //     // Zeige eine Fehlermeldung, wenn die E-Mail die gleiche ist
  //     alert("Die E-Mail-Adresse ist bereits aktuell.");
  //   } else {
  //     // Ansonsten, setze die neue E-Mail-Adresse
  //     const updatedUser = { ...loggedUser, email: newEmail };
  //     await updateProfileApi(updatedUser);
  //     updateUser(updatedUser);
  //     console.log("Profil erfolgreich aktualisiert", updatedUser);
  //   }
  // };

  const handleUserChange = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formdata = new FormData(e.target as HTMLFormElement);

    const emailUpdate: string =
      (formdata.get("newEmail") as string) || loggedUser?.email;

    // if (loggedUser.email === emailUpdate) {
    //   console.error("Email already exist in the Database and can`t be changed");
    // }

    // Debugging-Log
    // console.log("Logged User Email:", loggedUser?.email);
    // console.log("New Email Attempt:", emailUpdate);

    const userNameUpdate: string =
      (formdata.get("newUsername") as string) || loggedUser?.username;

    await updateProfileApi({
      id: loggedUser.id,
      img: loggedUser.img,
      username: userNameUpdate,
      email: emailUpdate,
    });

    updateUser({
      ...loggedUser,
      email: emailUpdate,
      username: userNameUpdate,
    });
    try {
      // Erfolgreiche Update-Bestätigung
      setSnackbarMessage("Profil updated successfully!");
      setOpenSnackbar(true);
      setTimeout(() => {
        navigate("/sunsets"); // Zur Liste der Sunsets navigieren
      }, 1500); // Wartezeit für Snackbar
    } catch (error) {
      setSnackbarMessage("Failed to update Profile!");
      setOpenSnackbar(true);
    }
  };

  const handleUserDelete = async (e: MouseEvent) => {
    e.preventDefault();
    // alert("Delete Button funtkioniert");

    deleteProfileApi(loggedUser.id);
    try {
      // Erfolgreiche Update-Bestätigung
      setSnackbarMessage("Userprofil deleted successfully!");
      setOpenSnackbar(true);
      setTimeout(() => {
        navigate("/sunsets"); // Zur Liste der Sunsets navigieren
      }, 1500); // Wartezeit für Snackbar
    } catch (error) {
      setSnackbarMessage("Failed to delete Profile!");
      setOpenSnackbar(true);
    }
  };

  // HOle die Sunsets des Users

  const [sunsets, setSunsets] = useState<NewSunset[]>([]); // anpassen, je nach Struktur der API-Daten
  //const [loading, setLoading] = useState<boolean>(true);

  // ?? KANN ICH NICHT VIELLEICHT DAS USER PROFILE NUTZEN; DENN DA SIND DIE POSTESSUNSETS JA SCHON VORHANDEN???
  // TO DO - ERROR HANDLING ??
  useEffect(() => {
    const fetchUserSunsets = async () => {
      const sunsets = await getUserSunsetsApi();
      setSunsets(sunsets);
    };
    fetchUserSunsets();
  }, []);

  return (
    <div
      className={`profile component-content-container ${
        isMenuOpen ? "content-container-menu-open" : ""
      }`}
    >
      <h1>Your Profile</h1>

      <br />

      {/* if we have a user  */}
      <div>
        {loggedUser && (
          <div>
            <h3>Hi {loggedUser.username}</h3>

            <div>
              <img
                src={loggedUser.img ? loggedUser.img : null}
                alt={`Avatar image of user ${loggedUser.username}`}
                style={{ width: "150px", height: "auto" }}
              />
            </div>

            <br />
            <p>E-Mail: {loggedUser.email}</p>
            <p>Username: {loggedUser.username}</p>

            <br />
            {/* Image Upload */}
            <p>Change your Profile Image:</p>
            <div>
              <form onSubmit={handleImageUpload}>
                <input
                  type="file"
                  name="username"
                  id="username-input"
                  // accept="image/*"
                  onChange={handleAttachFile}
                />
                <br />
                <button>Upload Image</button>
              </form>
            </div>
            <br />
            {/* CHANGE USERNAME & EMAIL  */}
            <div>
              <p>Change your Profile settings </p>
              <form onSubmit={handleUserChange}>
                <input
                  type="text"
                  name="newUsername"
                  id="newUsername"
                  defaultValue={loggedUser.username}
                />
                <br />

                <input
                  type="email"
                  name="newEmail"
                  id="newEmail"
                  defaultValue={loggedUser.email}
                />
                <br />
                <button type="submit">Save</button>
              </form>
            </div>

            {/* Change Username */}
            {/* <div>
              <p>Change your Username</p>
              <div>
                <form onSubmit={handleUsernameChange}>
                  <input
                    type="text"
                    name="newUsername"
                    id="newUsername"
                    defaultValue={loggedUser.username}
                  />
                  <br />
                  <button type="submit">Change Username</button>
                </form>
              </div>
            </div> */}

            {/* Change EMAIL */}
            {/* <div>
              <p>Change your Email</p>
              <div>
                <form onSubmit={handleEmailChange}>
                  <input
                    type="text"
                    name="newEmail"
                    id="newEmail"
                    defaultValue={loggedUser.email}
                  />
                  <br />
                  <button type="submit">Change Email</button>
                </form>
              </div>
            </div> */}
            <br />
            <button onClick={handleUserDelete}> Delete Account</button>
          </div>
        )}
        <br />
        <div>
          <h2>Your own Sunsets</h2>
        </div>

        {/* DISPLAYING Users Sunsets */}
        {sunsets && sunsets.length > 0 ? (
          <Grid container spacing={2}>
            {sunsets.map((sunset) => (
              <Grid
                size={{ xs: 12, sm: 6, md: 3, lg: 2 }}
                // size={{ xs: 12, sm: 6, md: 4}}
                key={sunset.id}
                className="card-container"
              >
                <NavLink
                  to={`/sunsets/${sunset._id}`}
                  // key={index}
                >
                  <Card className="card">
                    {/* Card Media for image */}
                    <CardMedia
                      component="img"
                      height="140"
                      image={sunset.img} //
                      alt={`Sunset image of user with the username ${loggedUser.username}`}
                    />
                    {/* Card Content */}
                    <CardContent>
                      <Typography variant="body2">{sunset.country}</Typography>
                    </CardContent>
                  </Card>
                </NavLink>
              </Grid>
            ))}
          </Grid>
        ) : (
          <p>You haven't uploaded any sunsets yet.</p>
        )}

        {/* {sunsets && sunsets.length === 0 ? (
          <p>You haven't uploaded any sunsets yet.</p>
        ) : (
          <div className="sunset-gallery">
            {sunsets.map((sunset) => (
              <div key={sunset.id} className="sunset-item">
                <img
                  src={sunset.img}
                  // alt={sunset.title}
                  alt={`Sunseg image of user ${loggedUser.username}`}
                  style={{ width: "150px", height: "auto" }}
                />
                <h3>{sunset.country}</h3>
                <p>{sunset.description}</p>
              </div>
            ))}
          </div>
        )} */}

        {/* Snackbar für Bestätigungsmeldungen */}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={3000} // Dauer für die Anzeige der Snackbar
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbarMessage.includes("Failed") ? "error" : "success"}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
}

export default Profile;
