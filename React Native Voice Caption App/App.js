import React, { useState, useEffect, useReducer } from "react";
import {
	Alert,
	View,
	StyleSheet,
	Text,
	TextInput,
	Button,
	Image,
	TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import * as SQLite from "expo-sqlite";

export default function App() {

  const db = SQLite.openDatabase("myFinalTestDB");

  useEffect(
		() => {
			db.transaction((tx) => {
				tx.executeSql(
					"CREATE TABLE IF NOT EXISTS ContactTable (id INTEGER PRIMARY KEY AUTOINCREMENT, pictureURI TEXT, audioURI TEXT, caption TEXT);",
					[],
					() => console.log("TABLE CREATED/FETCHED!"),
					(_, result) => console.log("TABLE CREATE failed:" + result)
				);
			});
			retrieveFromDatabase();
		},
		[]
	);

  let recording;
  let soundObj;

  const initialState = {
		contactImage: null,
		caption: "",
		showPlayBack: false,
		soundObject: null,
		recordingObj: null,
		imageForFile: "",
		audioForFile: "",
		imageFromFile: "-- FILE HAS NOT BEEN READ YET! --",
		audioFromFile: "-- FILE HAS NOT BEEN READ YET! --",
		alertImageURI: "",
		alertAudioURI: "",
		alertCaption: "",
		recordingStatus: "",
	};
	const reducer = (state, newState) => ({ ...state, ...newState });
	const [state, setState] = useReducer(reducer, initialState);

  const verifyPermissions = async () => {
		const cameraResult = await ImagePicker.requestCameraPermissionsAsync();
		const libraryResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    const result = await Audio.requestPermissionsAsync();
		if ( cameraResult.status !== "granted" && libraryResult.status !== "granted") {
			Alert.alert(
				"Insufficient Permissions!",
				"You need to grant camera permissions to use this app.",
				[{ text: "Okay" }]
			);
			return false;
		}

    if (result.status !== "granted") {
			Alert.alert(
				"Insufficient Permissions!",
				"You need to grant audio recording permissions to use this app.",
				[{ text: "Okay" }]
			);
			return false;
		}
		return true;
	};

  const imageSelectedHandler = (imagePath) => {
		setState({ contactImage: imagePath, imageForFile: imagePath });
	};

  const retrieveImageHandler = async () => {
		const hasPermission = await verifyPermissions();
		if (!hasPermission) {
			return false;
		}

		const image = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.5,
		});
		imageSelectedHandler(image.assets[0].uri);
		if (image.canceled) {
			state.contactImage(image.assets[0].uri);
		}
	};

  const startRecordingAudio = async () => {
    setState({ soundObject: null, recordingStatus: "Recording Started" });
    const hasPermission = await verifyPermissions();
    if (!hasPermission) {
      return false;
    } else {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: true,
      });

      recording = new Audio.Recording();
      try {
        await recording.prepareToRecordAsync(
          Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
        );
        await recording.startAsync();
        
        setState({recordingObj: recording});
        console.log("We are now recording!");
      } catch (error) {
        console.log("An error occurred on starting record:");
        console.log(error);
      }
    }
  };

  const stopRecordingAudio = async () => {
		try {
			await state.recordingObj.stopAndUnloadAsync();
			console.log("recording stopped!");
			setState({ showPlayBack: true, recordingStatus: "Recording Stopped" });
      setState({ audioForFile: state.recordingObj.getURI() });
		} catch (error) {
			console.log("An error occurred on stopping record:");
			console.log(error);
		}
	};

  const playRecordedAudio = async () => {
		await Audio.setAudioModeAsync({
			// set to false to play through speaker (instead of headset)
			allowsRecordingIOS: false,
			playsInSilentModeIOS: true,
			shouldDuckAndroid: true,
			playThroughEarpieceAndroid: false,
			staysActiveInBackground: true,
		});

		if (state.soundObject === null) {
			soundObj = new Audio.Sound();

			try {
				await soundObj.loadAsync({ uri: state.recordingObj.getURI() });
				await soundObj.setStatusAsync({ isLooping: false });
				await soundObj.playAsync();
        setState({ soundObject: soundObj});
				console.log("We are playing the recording!");
			} catch (error) {
				console.log("An error occurred on playback:");
				console.log(error);
			}
		} else {
			soundObj = state.soundObject;

			try {
				await soundObj.playAsync();
        setState({ soundObject: soundObj });
				console.log("We are resuming the recording!");
			} catch (error) {
				console.log("An error occurred on playback:");
				console.log(error);
			}
		}
	};

  const saveToFile = () => {
		const filePath = FileSystem.documentDirectory + "MyImageTextFile.txt";
		FileSystem.writeAsStringAsync(filePath, state.imageForFile, {})
			.then(() => {
				console.log("File was written!");
			})
			.catch((error) => {
				console.log("An error occurred: ");
				console.log(error);
			});
      const filePathAudio = FileSystem.documentDirectory + "MyAudioTextFile.txt";
			FileSystem.writeAsStringAsync(filePathAudio, state.audioForFile, {})
				.then(() => {
					console.log("File was written!");
				})
				.catch((error) => {
					console.log("An error occurred: ");
					console.log(error);
				});

      saveToDatabase();
	};

  // const readFromFile = () => {
	// 	const filePath = FileSystem.documentDirectory + "MyImageTextFile.txt";
	// 	FileSystem.readAsStringAsync(filePath, {})
	// 		.then((result) => {
  //       setState({ imageFromFile: result });
	// 		})
	// 		.catch((error) => {
	// 			console.log("An error occurred: ");
	// 			console.log(error);
	// 		});
  //     const filePath2 = FileSystem.documentDirectory + "MyAudioTextFile.txt";
	// 		FileSystem.readAsStringAsync(filePath2, {})
	// 			.then((result) => {
	// 				setState({ audioFromFile: result });
	// 			})
	// 			.catch((error) => {
	// 				console.log("An error occurred: ");
	// 				console.log(error);
	// 			});
	// };

  const handleCaptionInput = (text) => {
    setState({ caption: text });
  }

  const saveToDatabase = () => {
		db.transaction((tx) => {
			tx.executeSql(
				"INSERT OR REPLACE INTO ContactTable (id, pictureURI, audioURI, caption) values (1, ?, ?, ?)",
				[
					state.imageForFile,
					state.audioForFile,
					state.caption,
				],
				(_, { rowsAffected }) =>
					rowsAffected > 0
						? console.log("ROW INSERTED/UPDATED!")
						: console.log("INSERT/UPDATE FAILED!"),
				(_, result) => console.log("INSERT/UPDATE failed:" + result)
			);
		});
		retrieveFromDatabase();
	};

  const retrieveFromDatabase = () => {
		db.transaction((tx) => {
			tx.executeSql(
				"SELECT * FROM ContactTable LIMIT 1",
				[],
				(_, { rows }) => {
					console.log("ROWS RETRIEVED!");
					let entries = rows._array;

					entries.forEach((entry) => {
						setState({
							alertImageURI: entry.pictureURI,
							alertAudioURI: entry.audioURI,
							alertCaption: entry.caption,
						});
					});
				},
				(_, result) => {
					console.log("SELECT failed!");
					console.log(result);
				}
			);
		});
	};

  const showDBContents = () => {
    retrieveFromDatabase();
    Alert.alert(
      "Data from the DB",
      "Caption: " + state.alertCaption + "\nAudio URI: \n" + state.alertAudioURI +"\nImage URI: \n" + state.alertImageURI,
      [{ text: "Close" }]
    )
  }

	return (
		<View style={styles.container}>
			<Text style={styles.title}>FINAL EXAM</Text>
			<Text style={styles.author}>I_SAHNGAKEPSEU</Text>
			<TouchableOpacity
				style={styles.addPhotoButton}
				onPress={retrieveImageHandler}
			>
				{!state.contactImage ? (
					<Text style={styles.addImageText}>
						CLICK TO ADD PICTURE
					</Text>
				) : (
					<View style={styles.contactImage}>
						<Image source={{ uri: state.contactImage }} style={{ flex: 1 }} />
					</View>
				)}
			</TouchableOpacity>
			<View style={{ padding: 20, width: "100%" }}>
				<TextInput
					placeholder="Caption..."
					style={styles.captionInput}
					onChangeText={handleCaptionInput}
					value={state.caption}
				/>
			</View>
			<View style={styles.recordingButtonContainer}>
				<Button
					style={styles.button}
					title="Record Caption"
					onPress={startRecordingAudio}
				/>
				<Button
					style={styles.button}
					onPress={stopRecordingAudio}
					title="Stop Recording"
				/>
			</View>
			<View>
				<Text>{state.recordingStatus}</Text>
			</View>
			<View style={{ paddingVertical: 20 }}>
				{state.showPlayBack ? (
					<Button
						title="Play Caption"
						onPress={playRecordedAudio}
						color="green"
					/>
				) : null}
			</View>
			<Button color="red" title="SAVE" onPress={saveToFile} />
			<View style={styles.otherButtonsContainer}>
				<Button
					style={styles.showButton}
					title="Show DB Contents"
					onPress={showDBContents}
				/>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "cyan",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
	},
	title: {
		fontSize: 50,
		marginBottom: 5,
		textAlign: "center",
		fontWeight: "bold",
	},
	author: {
		fontSize: 25,
		marginBottom: 5,
		textAlign: "center",
		paddingBottom: 15,
    color: "#fff"
	},
	addPhotoButton: {
		width: 250,
		height: 250,
		backgroundColor: "darkred",
		alignItems: "center",
		justifyContent: "center",
		alignSelf: "center",
		elevation: 2,
		paddingBottom: 10,
	},
	contactImage: {
		width: 250,
		height: 250,
		overflow: "hidden",
		paddingBottom: 10,
		elevation: 2,
	},
  addImageText: { 
    color: "cyan",
    fontSize: 20,
    fontWeight: "bold"
  },
	captionInput: {
		width: "100%",
		borderWidth: 1,
		borderColor: "#ccc",
		fontSize: 15,
		backgroundColor: "#fff",
	},
	recordingButtonContainer: {
		paddingVertical: 15,
		flexDirection: "row",
		justifyContent: "space-between",
		width: "90%",
	},
	otherButtonsContainer: {
		paddingTop: 40,
		flexDirection: "column",
		justifyContent: "space-evenly",
		width: "90%",
	},
	button: {
		width: "50%",
	},
	showButton: {
		width: "100%",
		paddingVertical: 10,
	},
	fileOutput: {
		borderColor: "red",
		borderWidth: 1,
		margin: 5,
	},
});
