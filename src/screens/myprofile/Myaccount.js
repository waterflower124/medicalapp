import React, {Component} from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert, } from 'react-native';
import {createStackNavigator} from "react-navigation"
import {YellowBox, 
    KeyboardAvoidingView,
    Dimensions,
    Keyboard,
    TouchableWithoutFeedback,
    Platform, 
    ScrollView,
    TextInput,
    StatusBar
} from 'react-native';


import { SkypeIndicator } from 'react-native-indicators';
import moment from 'moment';
import ToggleSwitch from '../../utils/component/togglebutton/ToggleSwitch'
import ImagePicker from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import AsyncStorage from '@react-native-community/async-storage';

import Global from '../../utils/Global/Global'
import {getInset} from 'react-native-safe-area-view'

const bottomOffset = getInset('bottom');

var deviceWidth = Dimensions.get('window').width;
var deviceHeight = Dimensions.get('window').height;
var topviewHeight = Platform.OS == 'android' ? 80 - StatusBar.currentHeight : 80;
var tabbarHeight = 50
var main_viewHeight = Platform.OS == 'android' ? deviceHeight - topviewHeight - (tabbarHeight + 5) - StatusBar.currentHeight : deviceHeight - topviewHeight - (tabbarHeight + 5) - bottomOffset;/// bottom tabbar height
var title_view_height = 60;
var content_view_height = main_viewHeight - title_view_height;

var title_width = 150;

var item_width = deviceWidth * 0.9 * 0.9;
var item_height = 70;

const options = {
    title: 'Select avtar...',
    // customButtons: [{ name: 'fb', title: 'Choose Photo from Facebook' }],
    takePhotoButtonTitle: 'Select from camera',
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

export default class Myaccount extends Component {
    static navigationOptions = {
        header: null,
        headerBackTitle: null,
        tabBarOptions: {
            activeTintColor: '#ff0000'
        }
	};

	constructor(props){
		super();

		this.state = {
            isReady: false,
            showIndicator: false,

            first_name: Global.first_name,
            last_name: Global.last_name,

            current_address: '',

            avatar_url: Global.avatar_url,


		}
    }
    
    async componentWillMount() {
        if(Global.user_current_address == "") {
            this.setState({
                current_address : 'Your location'
            })
        } else {
            this.setState({
                current_address : Global.user_current_address
            })
        }
    };

    componentDidMount() {
        this.props.navigation.addListener('willFocus', this.init_user_address.bind(this));
    }

    init_user_address() {
        if(Global.acc_tmp_lat != 0.0 || Global.acc_tmp_lat != 0.0) {
            this.setState({
                selectedLat: Global.acc_tmp_lat,
                selectedLng: Global.acc_tmp_lat
            })
            this.getcurrent_address(Global.acc_tmp_lat, Global.acc_tmp_lat);
        }
    };

    getcurrent_address = async(currentLat, currentLng) => {
        await fetch('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + currentLat + ',' + currentLng + '&key=' + Global.MAPAPIKEY)
        .then(response => response.json())
        .then(data => {
            if(data.status == "OK") {
                this.setState({
                    current_address: data.results[0].formatted_address
                });
                Global.acc_tmp_lat = 0.0;
                Global.acc_tmp_lat = 0.0;
            } else {
                // console.warn("error.message")
            }
        })
        .catch(function(error) {
            console.log(error);
            Alert.alert('Warning!', 'Network error!');
        });
    }

    handlefirstname = (typedText) => {
        this.setState({
            first_name: typedText
        })
    }

    handlelastname = (typedText) => {
        this.setState({
            last_name: typedText
        })
    }

    select_location = () => {
        this.props.navigation.navigate('AccountLocation');
    }

    save_account_info = async() => {
        let signin_status = await AsyncStorage.getItem("signin");
        if(signin_status == "social") {
            Alert.alert("Warning!", "You can't edit your social account.");
            return;
        }
        if(this.state.first_name.trim() == "" ) {
            Alert.alert("Warning!", 'Please input First Name.');
            return;
        };
        if(this.state.last_name.trim() == "" ) {
            Alert.alert("Warning!", 'Please input Last Name.');
            return;
        };

        var formData = new FormData();
        let localUri = this.state.avatar_url;
        let localUriNamePart = localUri.split('/');
        const fileName = localUriNamePart[localUriNamePart.length - 1];
        let localUriTypePart = localUri.split('.');
        const fileType = localUriTypePart[localUriTypePart.length - 1];

        formData.append('image', {
            uri: this.state.avatar_url,
            name: fileName,
            type: `image/${fileType}`,
        });

        formData.append('token', Global.user_token);
        formData.append('first_name', this.state.first_name);
        formData.append('last_name', this.state.last_name);

        this.setState({showIndicator: true});
        await fetch(Global.base_url + 'user/update_profile', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: formData
        }).then(response => response.json())
        .then(data => {
            if(data.status == 1) {
                Alert.alert("Congratulation!", "Your account have been changed successfully.");
                Global.first_name = this.state.first_name;
                Global.last_name = this.state.last_name;
                Global.avatar_url = this.state.avatar_url;
            } else {
                Alert.alert("Warning!", "There's error in server");
            }
        })
        .catch(function(error) {
            Alert.alert('Warning!', 'Network error');
        });
        
        this.setState({showIndicator: false});
    }

    avatar_selecet_alert() {
        ImagePicker.showImagePicker(options, (response) => {
            const {error, uri, originalRotation} = response;
            if (response.didCancel) {
                console.log('image picker cancelled');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            } else {
                this.setState({avatar_url: response.uri});
                
            }
        });
    }

    render() {
        return (
            <View style={styles.container}>
            {
                this.state.showIndicator &&
                <View style = {{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black', opacity: 0.3, zIndex: 100}}>
                    <View style = {{flex: 1}}>
                        <SkypeIndicator color = '#ffffff' />
                    </View>
                </View>
            }
                <View style = {{width: '90%', height: topviewHeight, flexDirection: 'row'}}>
                    <TouchableOpacity style = {{width: '10%', height: '100%', justifyContent: 'flex-end'}} onPress = {() => this.props.navigation.navigate("Setting")}>
                        <Image style = {{width: 15, height: 15, marginBottom: 5}} resizeMode = {'contain'} source = {require('../../assets/images/back_button_black.png')}></Image>
                    </TouchableOpacity>
                    <View style = {{width: '90%', height: '100%', justifyContent: 'flex-end', alignItems: 'flex-start'}}>
                        <Text style = {{fontSize: 24, color: '#000000', fontFamily: 'Lato-Regular'}}>My account</Text>
                    </View>
                </View> 
                <View style = {{width: '100%', height: main_viewHeight, alignItems: 'center', paddingTop: 30}}>
                    <View style = {{width: '100%', height: 100, justifyContent: 'center', alignItems: 'center'}}>
                        <TouchableOpacity style = {{width: 100, height: 100, borderRadius: 100, overflow: 'hidden', borderColor: '#c0c0c0', borderWidth: 1}} onPress = {() => this.avatar_selecet_alert()}>
                        {
                            this.state.avatar_url == '' &&
                            <Image style = {{width: '100%', height: '100%'}} resizeMode = {'cover'} source = {require('../../assets/images/avatar_empty.png')}></Image>
                        }
                        {
                            this.state.avatar_url != '' &&
                            <Image style = {{width: '100%', height: '100%'}} resizeMode = {'cover'} source = {{uri: this.state.avatar_url}}></Image>
                        }
                        </TouchableOpacity>
                        {/* <TouchableOpacity style = {{width: 30, height: 30, position: 'absolute', bottom: 0, left: deviceWidth/2 - 50 - 30}} onPress = {() => this.image_from_camera()}>
                            <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../../assets/images/ic_camera.png')}></Image>
                        </TouchableOpacity>
                        <TouchableOpacity style = {{width: 30, height: 30, position: 'absolute', top: 0, right: deviceWidth/2 - 50 - 30}} onPress = {() => this.image_from_gallery()}>
                            <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../../assets/images/ic_gallery.png')}></Image>
                        </TouchableOpacity> */}
                    </View>
                    <View style = {styles.input_view}>
                        <Text style = {styles.item_text}>First Name</Text>
                        <TextInput style = {styles.input_text} autoCapitalize = 'none' placeholder = 'First name' onChangeText = {this.handlefirstname}>{this.state.first_name}</TextInput>
                    </View>
                    <View style = {styles.input_view}>
                        <Text style = {styles.item_text}>Last Name</Text>
                        <TextInput style = {styles.input_text} autoCapitalize = 'none' placeholder = 'Last name' onChangeText = {this.handlelastname}>{this.state.last_name}</TextInput>
                    </View>
                    <TouchableOpacity style = {styles.button_style} onPress = {() => this.save_account_info()}>
                        <Text style = {styles.item_text}>Save</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7f7f7',
        alignItems: 'center',
        // justifyContent: 'center',
    },
    item_text: {
        color: '#000000', 
        fontSize: 15, 
        fontFamily: 'Lato-Regular'
    },
    input_view: {
        width: '80%',
        height: 60,
        borderColor: '#c0c0c0',
        borderBottomWidth: 1,
        justifyContent: 'space-around',
        marginTop: 30
    },
    input_text: {
        color: '#000000', 
        fontSize: 15, 
        fontFamily: 'Lato-Regular',
        width: '100%',
        height: '100%'
    },
    button_style: {
        width: '80%',
        height: 40,
        marginTop: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: '#000000',
        borderWidth: 1,
        borderRadius: 10
    },

});
