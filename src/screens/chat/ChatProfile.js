import React, {Fragment, Component} from 'react';
import {
    YellowBox,
    SafeAreaView,
    StyleSheet,
    ScrollView,
    View,
    Text,
    StatusBar,
    TouchableOpacity,
    Image,
    Dimensions,
    Linking,
    Share,
    Platform,
    Alert,
    Keyboard
} from 'react-native';

import {getInset} from 'react-native-safe-area-view'
const base64 = require('base-64');
import { SkypeIndicator } from 'react-native-indicators';
import Global from '../../utils/Global/Global'
import { TextInput } from 'react-native-gesture-handler';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import firebaseApp from "../../utils/Global/firebaseConfig";
import firebase from "firebase";
import ImagePicker from 'react-native-image-picker';

YellowBox.ignoreWarnings(["Warning:"]);

var deviceWidth = Dimensions.get('window').width;
var deviceHeight = Dimensions.get('window').height;
var menu_bar_height = 50;
var safearea_height = deviceHeight - getInset('top') - getInset('bottom');
var main_view_height = Platform.OS == "ios" ? safearea_height - menu_bar_height : safearea_height - menu_bar_height - StatusBar.currentHeight;

const options = {
    title: 'Select avatar...',
    // customButtons: [{ name: 'fb', title: 'Choose Photo from Facebook' }],
    takePhotoButtonTitle: 'Select from Camera',
    chooseFromLibraryButtonTitle: 'Select from Library',
    storageOptions: {
        skipBackup: true,
        path: 'images',
        allowsEditing: true,
        width: '100%',
        height: '100%',
        aspect: [1, 1],
    },
};

export default class ChatProfile extends Component {
    static navigationOptions = {
        header: null,
        headerBackTitle: null,
	};

    constructor(props){
		super(props);

		this.state = {

            showIndicator: false,
            avatar_url: '',
            

		}
    }

    async componentDidMount() {
        let dbRef = firebaseApp.database().ref('users/' + Global.user_name).child("avatar_url");
        dbRef.once('value', (value) => {
            this.setState({
                avatar_url: value.val()
            });
        })
    }

    componentWillUnmount() {
        
    }

    avatar_select_alert() {
        ImagePicker.showImagePicker(options, (response) => {
            const {error, uri, originalRotation} = response;
            if (response.didCancel) {
                console.log('image picker cancelled');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            } else {
                // this.setState({
                //     avatar_url: response.uri
                // });
                this.upload_avatar(response.uri);
            }
        });
    }

    upload_avatar = async(image_uri) => {
        const ext = image_uri.split('.').pop(); // Extract image extension
        const filename = `${Global.user_name}.${ext}`; // Generate unique name
        this.setState({
            showIndicator: true
        })
        const response = await fetch(image_uri);
        const blob = await response.blob();
        var db_ref = firebaseApp.storage().ref().child('avatar/' + filename);

        await db_ref.put(blob);
        await db_ref.getDownloadURL().then(async(url) => {
            await firebaseApp.database().ref("users/" + Global.user_name).update({avatar_url: url})
            .then(async() => {
                this.setState({
                    avatar_url: url
                });
            }).catch((error) => {
                Alert.alert('Warning!', "Network error");
            })
        })
        this.setState({
            showIndicator: false
        })
    }


    render() {
        return (
            <KeyboardAwareScrollView style = {{flex: 1}}>
                <SafeAreaView style = {styles.container}>
                {
                    this.state.showIndicator &&
                    <View style = {{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black', opacity: 0.3, zIndex: 100}}>
                        <View style = {{flex: 1}}>
                            <SkypeIndicator color = '#ffffff' />
                        </View>
                    </View>
                }
                    <View style = {styles.menu_bar}>
                        <View style = {{width: '20%', height: '100%', justifyContent: 'center', marginLeft: 20}}>
                            <TouchableOpacity onPress = {() => this.props.navigation.navigate('ChatContacts')}>
                                <Image style = {{width: 20, height: 20}} resizeMode = {'contain'} source={require('../../assets/images/menu_back_arrow.png')}/>
                            </TouchableOpacity>
                        </View>
                        
                    </View>
                    <View style = {{width: '100%', height: main_view_height, alignItems: 'center'}}>
                        <View style = {{width: '100%', height: '40%', justifyContent: 'center', alignItems: 'center', backgroundColor: '#a3a2a3'}}>
                            <View style = {{height: main_view_height * 0.4 * 0.7, width: main_view_height * 0.4 * 0.7}}>
                            {
                                this.state.avatar_url == "" &&
                                <Image style = {{width: "100%", height: "100%", borderRadius: main_view_height * 0.4 * 0.7}} resizeMode = {'cover'} source={require('../../assets/images/avatar_empty.png')}/>
                            }
                            {
                                this.state.avatar_url != "" &&
                                <Image style = {{width: "100%", height: "100%", borderRadius: main_view_height * 0.4 * 0.7}} resizeMode = {'cover'} source={{uri: this.state.avatar_url}}/>
                            }   
                                <TouchableOpacity style = {{width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: '#787871', borderRadius: 40, position: 'absolute', zIndex: 10, right: 10, bottom: 0}}
                                onPress = {() => this.avatar_select_alert()}>
                                    <Image style = {{width: '70%', height: '70%'}} resizeMode = {'contain'} source={require('../../assets/images/chat_profile_camera.png')}/>
                                </TouchableOpacity>
                                {/* <TouchableOpacity style = {{width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: '#787871', borderRadius: 40, position: 'absolute', zIndex: 10, left: 10, bottom: 0}}>
                                    <Image style = {{width: '70%', height: '70%'}} resizeMode = {'contain'} source={require('../../assets/images/chat_profile_gallery.png')}/>
                                </TouchableOpacity> */}
                            </View>
                        </View>
                        <View style = {{width: '100%', height: '60%', alignItems: 'center'}}>
                            <View style = {{width: '95%', height: 100, marginTop: 10, borderWidth: 1, borderColor: '#808080', borderRadius: 5, alignItems: 'center'}}>
                                <View style = {{width: '80%', height: '60%', justifyContent: 'center'}}>
                                    <Text style = {{fontSize: 24, color: '#404040'}}>About</Text>
                                </View>
                                <View style = {{width: '80%', height: '40%', alignItems: 'center', flexDirection: 'row'}}>
                                    <Image style = {{width: 20, height: 20}} resizeMode = {'contain'} source={require('../../assets/images/chat_profile_email.png')}/>
                                    <Text style = {{fontSize: 18, color: '#808080', marginLeft: 10}}>{Global.user_name}</Text>
                                </View>
                                {/* <View style = {{width: '80%', height: '23%', alignItems: 'center', flexDirection: 'row'}}>
                                    <Image style = {{width: 20, height: 20}} resizeMode = {'contain'} source={require('../../assets/images/chat_profile_phone.png')}/>
                                    <Text style = {{fontSize: 18, color: '#808080', marginLeft: 10}}>About</Text>
                                </View>
                                <View style = {{width: '80%', height: '23%', alignItems: 'center', flexDirection: 'row'}}>
                                    <Image style = {{width: 20, height: 20}} resizeMode = {'contain'} source={require('../../assets/images/chat_profile_marker.png')}/>
                                    <Text style = {{fontSize: 18, color: '#808080', marginLeft: 10}}>About</Text>
                                </View> */}
                            </View>
                        </View> 
                    </View>
                </SafeAreaView>
            </KeyboardAwareScrollView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        width: deviceWidth,
        height: deviceHeight,
        backgroundColor: '#ffffff',
        alignItems: 'center'
    },
    menu_bar: {
        width: '100%',
        height: menu_bar_height,
        backgroundColor: '#445774',
        flexDirection: 'row'
    },
})