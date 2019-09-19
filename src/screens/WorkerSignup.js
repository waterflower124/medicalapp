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
import Global from '../utils/Global/Global'
import { TextInput } from 'react-native-gesture-handler';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import firebaseApp from "../utils/Global/firebaseConfig";

YellowBox.ignoreWarnings(["Warning:"]);

var deviceWidth = Dimensions.get('window').width;
var deviceHeight = Dimensions.get('window').height;
var menu_bar_height = 50;
var safearea_height = deviceHeight - getInset('top') - getInset('bottom');
var main_view_height = Platform.OS == "ios" ? safearea_height - menu_bar_height : safearea_height - menu_bar_height - StatusBar.currentHeight;

export default class WorkerSignup extends Component {
    static navigationOptions = {
        header: null,
        headerBackTitle: null,
	};

    constructor(props){
		super(props);

		this.state = {

            showIndicator: false,
            user_name: '',
            password: '',
            advocate_userid: '',
            confim_password: '',
            userCode: '',

            update_account: Global.update_account

		}
    }

    async componentDidMount() {
        this.props.navigation.addListener('willFocus', this.initialization.bind(this));
    }

    componentWillUnmount() {
        this.setState({
            update_account: false
        });
        Global.update_account = false;
    }

    initialization() {
        if(this.state.update_account) {
            this.setState({
                user_name: Global.profile_user_name,
                password: Global.password,
                userCode: Global.userCode,
                advocate_userid: Global.advocate_userid
            });
        }
    }

    signup = async() => {
        if(this.state.user_name == "") {
            Alert.alert("Warning!", "Please input Username.");
            return;
        } 
        if(this.state.userCode.length != 4) {
            Alert.alert("Warning!", "User code have to be 4 digits");
            return;
        } 
        if(this.state.password < 6) {
            Alert.alert("Warning!", "Password have to be at least 6 characters.");
            return;
        }
        if(this.state.password != this.state.confim_password) {
            Alert.alert("Warning!", "Password does not match.");
            return;
        }

        Keyboard.dismiss();

        if(this.state.update_account) {
            this.setState({showIndicator: true})
            await fetch(Global.base_url + '/signup/' + Global.signup_id, {
                method: 'PUT',
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                    'Authorization': 'Basic ' + base64.encode(Global.user_name + ":" + Global.password)
                },
                body: JSON.stringify({
                    userName: this.state.user_name,
                    father: this.state.advocate_userid,
                    password: this.state.password,
                    userCode: this.state.userCode,
                    id: Global.signup_id
                })
            })
            .then(response => {
                const status_code = response.status;
                if(status_code == 200) {
                    return data = response.json();
                } else if(status_code == 406) {
                    return {'error': 406};
                } else {
                    return {'error': 0};
                }
            })
            .then(data=> {
                if(data.error == 406) {
                    Alert.alert("Warning!", "Username already exist. Please try again with another Username");
                } else if(data.error == 0) {
                    Alert.alert("Warning!", "There's some problem in server. Please try again later");
                } else {
                    var alert_message = "";
                    if(this.state.update_account) {
                        alert_message = "Your account is updated successfully";
                    } else {
                        alert_message = "Your account is created successfully";
                    }
                    Alert.alert("Success", alert_message,
                    [
                        {text: 'Cancel', onPress: null},
                        {text: 'OK', onPress: async() => {
                            this.props.navigation.navigate("Login");
                        }}
                    ],
                    { cancelable: true })
                }
            })
            .catch(function(error) {
                Alert.alert('Warning!', "Network error!");
            });
            this.setState({showIndicator: false})
        } else {
            this.setState({showIndicator: true})
            await fetch(Global.base_url + '/signup', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userName: this.state.user_name,
                    father: this.state.advocate_userid,
                    password: this.state.password,
                    userCode: this.state.userCode,
                    id: 0
                })
            })
            .then(response => {
                const status_code = response.status;
                if(status_code == 201) {
                    return data = response.json();
                } else if(status_code == 406) {
                    return {'error': 406};
                } else {
                    return {'error': 0};
                }
            })
            .then(async data=> {
                if(data.error == 406) {
                    Alert.alert("Warning!", "Username already exist. Please try again with another Username");
                } else if(data.error == 0) {
                    Alert.alert("Warning!", "There's some problem in server. Please try again later");
                } else {
                    await firebaseApp.database().ref("users/" + this.state.user_name).set({name: this.state.user_name})
                    .then(async() => {

                        firebaseApp.database().ref("users/" + this.state.user_name).update({name: this.state.user_name, avatar_url: ""})
                        .then(async() => {
                        }).catch((error) => {
                            // Alert.alert('Warning!', "Network error.");
                        })

                        var alert_message = "";
                        if(this.state.update_account) {
                            alert_message = "Your account is updated successfully";
                        } else {
                            alert_message = "Your account is created successfully";
                        }
                        Alert.alert("Success", alert_message,
                        [
                            {text: 'Cancel', onPress: null},
                            {text: 'OK', onPress: async() => {
                                this.props.navigation.navigate("Login");
                            }}
                        ],
                        { cancelable: true });
                    }).catch((error) => {
                        Alert.alert('Warning!', "Network error!");
                    })
                }
            })
            .catch(function(error) {
                Alert.alert('Warning!', "Network error!");
            });
            this.setState({showIndicator: false})
        }
    }

    render() {
        return (
            <KeyboardAwareScrollView style = {{flex: 1}}>
            <View style = {styles.container}>
            {
                this.state.showIndicator &&
                <View style = {{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black', opacity: 0.3, zIndex: 100}}>
                    <View style = {{flex: 1}}>
                        <SkypeIndicator color = '#ffffff' />
                    </View>
                </View>
            }
            {
                this.state.update_account &&
                <TouchableOpacity style = {styles.back_button} onPress = {() => this.props.navigation.navigate("Home")}>
                    <Image style = {{width: 20, height: 20}} resizeMode = {'contain'} source={require('../assets/images/menu_back_arrow_black.png')}/>
                </TouchableOpacity>
            }
                <View style = {styles.logo_view}>
                    <Image style = {{width: '60%', height: '60%'}} resizeMode = {'contain'} source={require('../assets/images/logo.png')}/>
                </View>
                <View style = {styles.medium_view}>
                        {/* <View style = {styles.input_view}>
                            <TextInput style = {styles.input_text} placeholder = {'Email'} autoCapitalize={false} onChangeText = {(text) => this.setState({email: text})}>{this.state.email}</TextInput>
                        </View> */}
                        <View style = {styles.input_view}>
                        {
                            this.state.update_account &&
                            <TextInput style = {styles.input_text} editable={false} placeholder = {'Username'} autoCapitalize={false} onChangeText = {(text) => this.setState({user_name: text})}>{this.state.user_name}</TextInput>
                        }
                        {
                            !this.state.update_account &&
                            <TextInput style = {styles.input_text} placeholder = {'Username'} autoCapitalize={false} onChangeText = {(text) => this.setState({user_name: text})}>{this.state.user_name}</TextInput>
                        }
                        </View>
                        <View style = {styles.input_view}>
                            <TextInput style = {styles.input_text} placeholder = {'Advocate User ID'} autoCapitalize={false} onChangeText = {(text) => this.setState({advocate_userid: text})}>{this.state.advocate_userid}</TextInput>
                        </View>
                        <View style = {styles.input_view}>
                            <TextInput style = {styles.input_text} placeholder = {'4 digit code'} keyboardType = {'number-pad'} onChangeText = {(text) => this.setState({userCode: text})}>{this.state.userCode}</TextInput>
                        </View>
                        <View style = {styles.input_view}>
                            <TextInput style = {styles.input_text} placeholder = {'Password'} secureTextEntry = {true} onChangeText = {(text) => this.setState({password: text})}>{this.state.password}</TextInput>
                        </View>
                        <View style = {styles.input_view}>
                            <TextInput style = {styles.input_text} placeholder = {'Confirm Password'} secureTextEntry = {true} onChangeText = {(text) => this.setState({confim_password: text})}>{this.state.confim_password}</TextInput>
                        </View>
                   
                    <TouchableOpacity style = {styles.button_view} onPress = {() => this.signup()}>
                        <Text style = {styles.button_text}>{this.state.update_account ? "UPDATE ACCOUNT" : "CREATE E-PATIENT ACCOUNT"}</Text>
                    </TouchableOpacity>
                {
                    !this.state.update_account &&
                    <TouchableOpacity style = {{marginTop: 30, marginBottom: 30}} onPress = {() => this.props.navigation.navigate("Login")}>
                        <Text style = {styles.common_text}>Already a member? Login</Text>
                    </TouchableOpacity>
                }
   
                </View>
                
            </View>
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
    logo_view: {
        width: '100%',
        height: '20%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    medium_view: {
        width: '90%',
        alignItems: 'center'
    },
    input_view: {
        width: '100%',
        height: 40,
        borderBottomColor: '#ff0000',
        borderBottomWidth: 1,
        marginTop: 10
    },
    input_text: {
        width: '100%',
        height: '100%',
        fontSize: 16,
        color: '#000000',
        padding: 0
    },
    common_text: {
        color: '#000000',
        fontSize: 14
    },
    button_view: {
        width: '100%',
        height: 40,
        borderRadius: 5,
        backgroundColor: '#ff0000',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20
    },
    button_text: {
        fontSize: 16,
        color: '#ffffff',
        fontWeight: 'bold'
    },
    back_button: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 30,
        left: 20,
        zIndex: 10
    }
})