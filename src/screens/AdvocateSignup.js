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
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import RadioForm from '../utils/component/radiobutton/SimpleRadioButton'

YellowBox.ignoreWarnings(["Warning:"]);

var deviceWidth = Dimensions.get('window').width;
var deviceHeight = Dimensions.get('window').height;
var menu_bar_height = 50;
var safearea_height = deviceHeight - getInset('top') - getInset('bottom');
var main_view_height = Platform.OS == "ios" ? safearea_height - menu_bar_height : safearea_height - menu_bar_height - StatusBar.currentHeight;

var radio_props = [
    {label: 'Yes', value: 'YES' },
    {label: 'No', value: 'NO' }
];

export default class AdvocateSignup extends Component {
    static navigationOptions = {
        header: null,
        headerBackTitle: null,
	};

    constructor(props){
		super(props);

		this.state = {

            showIndicator: false,

            user_name: '',
            full_name: '',
            tags: '',
            user_location: '',
            web_page: '',
            email: '',
            phone_number: '',
            userCode: '',
            password: '',
            confim_password: '',
            father: 'No',

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
                user_name: Global.user_name,
                father: Global.father,
                password: Global.password,
                userCode: Global.userCode,
                email: Global.email,
                user_location: Global.paarea,
                web_page: Global.padesc,
                full_name: Global.paname,
                phone_number: Global.phone,
                tags: Global.paorg
            });
        }
    }

    signup = async() => {
        Keyboard.dismiss();
        if(this.state.user_name == "") {
            Alert.alert("Warning!", "Please input Username.");
            return;
        } 
        if(this.state.full_name == "") {
            Alert.alert("Warning!", "Please input Full Name.");
            return;
        } 
        if(this.state.email != '') {
            let regExpression = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ ;
            if(regExpression.test(this.state.email) === false) {
                Alert.alert("Warning!", 'Please use valid Email address.');
                return;
            };
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
                    father: this.state.father,
                    password: this.state.password,
                    userCode: this.state.userCode,
                    email: this.state.email,
                    paarea: this.state.user_location,
                    padesc: this.state.web_page,
                    paname: this.state.full_name,
                    phone: this.state.phone_number,
                    paorg: this.state.tags,
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
                    father: this.state.father,
                    password: this.state.password,
                    userCode: this.state.userCode,
                    email: this.state.email,
                    paarea: this.state.user_location,
                    padesc: this.state.web_page,
                    paname: this.state.full_name,
                    phone: this.state.phone_number,
                    paorg: this.state.tags
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
            .then(async data => {
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
                        { cancelable: true })
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
                <TouchableOpacity style = {styles.back_button} onPress = {() => this.props.navigation.navigate("AdvocateHome")}>
                    <Image style = {{width: 20, height: 20}} resizeMode = {'contain'} source={require('../assets/images/menu_back_arrow_black.png')}/>
                </TouchableOpacity>
            }
                <View style = {styles.logo_view}>
                    <Image style = {{width: '60%', height: '60%'}} resizeMode = {'contain'} source={require('../assets/images/logo.png')}/>
                </View>
                <View style = {styles.medium_view}>
                <KeyboardAwareScrollView style = {{width: '100%'}} showsVerticalScrollIndicator = {false}>
                    <View style = {{width: '100%', alignItems: 'center'}}>
                    
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
                            <TextInput style = {styles.input_text} placeholder = {'Full Name'} autoCapitalize={false} onChangeText = {(text) => this.setState({full_name: text})}>{this.state.full_name}</TextInput>
                        </View>
                        <View style = {styles.input_view}>
                            <TextInput style = {styles.input_text} placeholder = {'Tags(Ex: nurse,billing,beside,geriatric,etc)'} keyboardType = {'number-pad'} autoCapitalize={false}  onChangeText = {(text) => this.setState({tags: text})}>{this.state.tags}</TextInput>
                        </View>
                        <View style = {styles.input_view}>
                            <TextInput style = {styles.input_text} placeholder = {'Locations'} autoCapitalize={false} onChangeText = {(text) => this.setState({user_location: text})}>{this.state.user_location}</TextInput>
                        </View>
                        <View style = {styles.input_view}>
                            <TextInput style = {styles.input_text} placeholder = {'Web Page'} autoCapitalize={false} onChangeText = {(text) => this.setState({web_page: text})}>{this.state.web_page}</TextInput>
                        </View>
                        <View style = {styles.input_view}>
                            <TextInput style = {styles.input_text} placeholder = {'Email Address'} autoCapitalize={false} onChangeText = {(text) => this.setState({email: text})}>{this.state.email}</TextInput>
                        </View>
                        <View style = {styles.input_view}>
                            <TextInput style = {styles.input_text} placeholder = {'Phone numbers'} keyboardType = {'number-pad'} onChangeText = {(text) => this.setState({phone_number: text})}>{this.state.phone_number}</TextInput>
                        </View>
                        <View style = {styles.input_view}>
                            <TextInput style = {styles.input_text} placeholder = {'4digit code*'} autoCapitalize={false} onChangeText = {(text) => this.setState({userCode: text})}>{this.state.userCode}</TextInput>
                        </View>
                        <View style = {styles.input_view}>
                            <TextInput style = {styles.input_text} placeholder = {'Password'} secureTextEntry = {true} onChangeText = {(text) => this.setState({password: text})}>{this.state.password}</TextInput>
                        </View>
                        <View style = {styles.input_view}>
                            <TextInput style = {styles.input_text} placeholder = {'Confirm Password'} secureTextEntry = {true} onChangeText = {(text) => this.setState({confim_password: text})}>{this.state.confim_password}</TextInput>
                        </View>
                        <View style = {[styles.input_view, {flexDirection: 'row'}]}>
                            <View style = {{width: '30%', height: '100%', justifyContent: 'center'}}>
                                <Text style = {{fontSize: 16, color: '#000000',}}>BCPA</Text>
                            </View>
                            <View style = {{width: '70%', height: '100%', justifyContent: 'center'}}>
                            {
                                this.state.father == "YES" &&
                                <RadioForm
                                    radio_props={radio_props}
                                    initial={0}
                                    formHorizontal={true}
                                    labelHorizontal={true}
                                    buttonSize={15}
                                    buttonColor={'#ff954c'}
                                    selectedButtonColor = {'#ff954c'}
                                    labelStyle = {{fontSize: 14, color: '#000000', marginRight: 5}}
                                    animation={true}
                                    onPress={(value) => {this.setState({father: value})}}
                                />
                            }
                            {
                                this.state.father != "YES" &&
                                <RadioForm
                                    radio_props={radio_props}
                                    initial={1}
                                    formHorizontal={true}
                                    labelHorizontal={true}
                                    buttonSize={15}
                                    buttonColor={'#ff954c'}
                                    selectedButtonColor = {'#ff954c'}
                                    labelStyle = {{fontSize: 14, color: '#000000', marginRight: 5}}
                                    animation={true}
                                    onPress={(value) => {this.setState({father: value})}}
                                />
                            }  
                            </View>
                        </View>
                        <TouchableOpacity style = {styles.button_view} onPress = {() => this.signup()}>
                            <Text style = {styles.button_text}>{this.state.update_account ? "UPDATE ACCOUNT" : "CREATE ADVOCATE ACCOUNT"}</Text>
                        </TouchableOpacity>
                    {
                        !this.state.update_account &&
                        <TouchableOpacity style = {{marginTop: 20, marginBottom: 30}} onPress = {() => this.props.navigation.navigate("Login")}>
                            <Text style = {styles.common_text}>Already a member? Login</Text>
                        </TouchableOpacity>
                    }
                    </View>
                    </KeyboardAwareScrollView>
                </View>
                    
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        height: '80%',
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