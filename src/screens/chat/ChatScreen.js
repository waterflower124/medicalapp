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
import Global from '../../utils/Global/Global';
import firebaseApp from "../../utils/Global/firebaseConfig";
import firebase from "firebase";
import { TextInput } from 'react-native-gesture-handler';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

YellowBox.ignoreWarnings(["Warning:"]);
YellowBox.ignoreWarnings(['Setting a timer']);

var deviceWidth = Dimensions.get('window').width;
var deviceHeight = Dimensions.get('window').height;
var menu_bar_height = 70;
var safearea_height = deviceHeight - getInset('top') - getInset('bottom');
var input_view_height = 60
var main_view_height = Platform.OS == "ios" ? safearea_height - menu_bar_height - 10 : safearea_height - menu_bar_height - StatusBar.currentHeight - 10;

export default class ScoreFacotrs extends Component {
    static navigationOptions = {
        header: null,
        headerBackTitle: null,
	};

    constructor(props){
		super(props);

		this.state = {

            showIndicator: false,

            keyboardHeight: 0,
            chat_type: props.navigation.state.params.chat_type,
            // selected_disease: props.navigation.state.params.disease,
            message_list: [],
            text_message: '',
            text_input_height: 0,
		}
    }

    async UNSAFE_componentWillMount() {
       
        
    };

    go_back() {
        // firebaseApp.
        this.props.navigation.navigate("ChatContacts");
    }

    componentDidMount() {

        this.willFocusListener =  this.props.navigation.addListener('willFocus', this.init_chat.bind(this));

        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
    }

    componentWillUnmount() {

        this.willFocusListener.remove();

        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }

    init_chat = async() => {
        if(this.props.navigation.state.params.chat_type) {
            let chat_type = this.props.navigation.state.params.chat_type;
            if(chat_type == "group") {
                var converted_diseasecode = props.navigation.state.params.disease;
                converted_diseasecode = converted_diseasecode.replace('.', '');
                let dbRef = firebaseApp.database().ref('messages/group').child(converted_diseasecode);
                await dbRef.on('child_added', (value) => {
                    let message = value.val();
                    this.setState({
                        message_list: [...this.state.message_list, message]
                    });
                    // console.warn(message.message)
                });
            } else if(chat_type == "recent") {
                
            }
        }
    }

    _keyboardDidShow(e) {
        this.setState({
            keyboardHeight: e.endCoordinates.height
        });
    }
    
    _keyboardDidHide(e) { 
         this.setState({
            keyboardHeight: 0
        });
    }

    send_message = async() => {
        if(this.state.text_message != 0) {
            if(this.state.chat_type == "group") {
                var converted_diseasecode = this.state.selected_disease.diagnoseCode;
                converted_diseasecode = converted_diseasecode.replace('.', '');
                let dbRef = firebaseApp.database().ref('messages/group').child(converted_diseasecode).push().key;
                let updates = {};
                let message = {
                    message: this.state.text_message,
                    created_at: firebase.database.ServerValue.TIMESTAMP,
                    from: Global.user_name
                };
                // updates['messages/' + Global.user_name + '/' + this.state.opponent_name + '/' + dbRef] = message;
                updates['messages/group/' + converted_diseasecode + '/' + dbRef] = message;
                this.setState({
                    text_message: '',
                    text_input_height: 0
                });
                await firebaseApp.database().ref().update(updates);
            } else if(this.state.chat_type = "recent") {
                let dbRef = firebaseApp.database().ref('messages/recent').child(Global.user_name).push().key;
                let updates = {};
                let message = {
                    message: this.state.text_message,
                    created_at: firebase.database.ServerValue.TIMESTAMP,
                    from: Global.user_name
                };
                updates['messages/' + this.state.opponent_name + '/' + Global.user_name + '/' + dbRef] = message;
                updates['messages/group/' + Global.user_name + '/' + dbRef] = message;
                this.setState({
                    text_message: '',
                    text_input_height: 0
                });
                await firebaseApp.database().ref().update(updates);
            }
        }
    }

    convert_time(time) {
        let d = new Date(time);
        let c = new Date();
        let result = (d.getHours() < 10 ? '0' : '') + d.getHours() + ':';
        result += (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
        if(c.getDay() != d.getDay()) {
            result = d.getDate() + "/" + (d.getMonth() + 1) + ' ' + result;
        };
        return result;
    }

    render() {
        return (
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
                <View style = {{width: '20%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
                    <TouchableOpacity onPress = {() => this.go_back()}>
                        <Image style = {{width: 20, height: 20}} resizeMode = {'contain'} source={require('../../assets/images/menu_back_arrow.png')}/>
                    </TouchableOpacity>
                </View>
                <View style = {{width: '70%', height: '100%', justifyContent: 'center'}}>
                {
                    this.state.selected_disease.diagnoseCode == "EpatientIndex" &&
                    <Text style = {{fontSize: 18, color: '#ffffff'}} numberOfLines = {1} renderTruncatedFooter = {() => null}>EpatientIndex</Text>
                }
                {
                    this.state.selected_disease.diagnoseCode != "EpatientIndex" &&
                    <Text style = {{fontSize: 18, color: '#ffffff'}} numberOfLines = {1} renderTruncatedFooter = {() => null}>{this.state.selected_disease.diagnoseCode} : {this.state.selected_disease.diagnoseDesc}</Text>
                }
                </View>
                {/* <View style = {{width: '20%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
                    <TouchableOpacity onPress = {() => this.props.navigation.navigate("Home")}>
                        <Image style = {{width: 30, height: 30}} resizeMode = {'contain'} source={require('../../assets/images/right_home.png')}/>
                    </TouchableOpacity>
                </View> */}
            </View>
            <View style = {{width: '95%', height: main_view_height - this.state.keyboardHeight - Math.max(this.state.text_input_height + 20, 60), alignItems: 'center'}}>
                <View style = {{width: '100%', height: '100%'}}>
                    <ScrollView style = {{width: '100%'}} ref={scrollView => this.scrollView = scrollView} onContentSizeChange={(contentWidth, contentHeight) => this.scrollView.scrollToEnd({animated: true})}>
                    {
                        this.state.message_list.map((item, index) => 
                        <View key = {index} style = {{width: '100%', marginTop: 10, alignItems: item.from == Global.user_name ? 'flex-end' : 'flex-start'}}>
                            <View style = {[styles.message_item_style, {backgroundColor: item.from == Global.user_name ? '#e1ffc7' : '#ffffff'}]}>
                                <View>
                                    <Text style = {styles.message_text_style}>{item.message}</Text>
                                </View>
                                <View style = {{width: '100%', flexDirection: 'row', alignSelf: 'flex-end'}}>
                                    <Text style = {styles.time_text_style}>{item.from}: </Text>
                                    <Text style = {styles.time_text_style}>{this.convert_time(item.created_at)}</Text>
                                </View>
                            </View>
                        </View>
                        )
                    }
                    </ScrollView>
                </View>
            </View>
            <View style = {[styles.text_input_view, {height: Math.max(this.state.text_input_height + 20, 60), 
                bottom: this.state.keyboardHeight == 0 ? getInset('bottom') : (Platform.OS == "ios" ? this.state.keyboardHeight : 0), 
                }]}>
                <View style = {{width: '95%', height: '100%', alignItems: 'center', flexDirection: 'row',}}>
                    <TextInput 
                        style = {[styles.input_text_view, {height: Math.max(this.state.text_input_height, 40)}]} 
                        multiline={true} 
                        onChangeText = {(text) => this.setState({text_message: text})}
                        onContentSizeChange = {(event) => {this.setState({text_input_height: event.nativeEvent.contentSize.height})}}
                        onFocus = {() => this.setState({})}
                    >
                        {this.state.text_message}
                    </TextInput>
                    <TouchableOpacity style = {styles.send_icon_view} onPress = {() => this.send_message()}>
                        <Image style = {{width: 30, height: 30}} resizeMode = {'contain'} source={require('../../assets/images/send_message.png')}/>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
        
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#e4dbd4',
        alignItems: 'center'
    },
    menu_bar: {
        width: '100%',
        height: menu_bar_height,
        backgroundColor: '#445774',
        flexDirection: 'row'
    },
    message_item_style: {
        maxWidth: '70%',
        padding: 5,
        borderRadius: 5,
        
    },
    time_text_style: {
        fontSize: 10,
        color: '#808080'
    },
    message_text_style: {
        fontSize: 16,
        color: '#000000'
    },
    text_input_view: {
        width: '100%',
        // height: input_view_height,
        position: 'absolute',
        alignItems: 'center'
    },
    input_text_view: {
        width: deviceWidth * 0.95 - 40,
        // height: 40,
        fontSize: 16,
        justifyContent: 'center',
        color: '#000000',
        padding: 5,
        borderColor: '#808080',
        borderWidth: 1,
        borderRadius: 5
    },
    send_icon_view: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center'
    }
})