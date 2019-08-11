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
  TouchableWithoutFeedback
} from 'react-native';

import {getInset} from 'react-native-safe-area-view'
const base64 = require('base-64');
import { SkypeIndicator } from 'react-native-indicators';
import Global from '../utils/Global/Global'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { TextInput } from 'react-native-gesture-handler';
import DateTimePicker from "react-native-modal-datetime-picker";
import moment from 'moment';

YellowBox.ignoreWarnings(["Warning:"]);

var deviceWidth = Dimensions.get('window').width;
var deviceHeight = Dimensions.get('window').height;
var menu_bar_height = 50;
var safearea_height = deviceHeight - getInset('top') - getInset('bottom');
var main_view_height = Platform.OS == "ios" ? safearea_height - menu_bar_height : safearea_height - menu_bar_height - StatusBar.currentHeight;

export default class NewCase extends Component {
    static navigationOptions = {
        header: null,
        headerBackTitle: null,
	};

    constructor(props){
		super(props);

		this.state = {

            showIndicator: false,

            bodypart_list: [],
            case_date: null,
            case_date_string: '',
            selected_body_part: null,
            brief_desc: '',
            isDateTimePickerVisible: false,
		}
    }

    async UNSAFE_componentWillMount() {
        this.setState({showIndicator: true})
        await fetch(Global.base_url + '/bodypart')
        .then(response => response.json())
        .then(async data => {
            this.setState({
                bodypart_list: data
            });
        })
        .catch(function(error) {
            Alert.alert('Warning!', error.message);
        });
        this.setState({showIndicator: false})
    }

    save_newcase = async() => {
        if(this.state.case_date_string == "" || this.state.selected_body_part == null || this.state.brief_desc == "") {
            Alert.alert("Warning!", "Please fill all of fields.");
            return;
        }
        var request_body = {
            "caseDate": this.state.case_date_string,
            "caseStatus": "",
            "description": this.state.brief_desc,
            "doctorName": "",
            "hospitalName": "",
            "id": 0,
            "pampIndex": 0,
            "partName": this.state.selected_body_part.partName,
            "specialty": "",
            "userName": Global.user_name
        }
        this.setState({showIndicator: true})
        await fetch(Global.base_url + '/medcase', {
            method: "POST",
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Authorization': 'Basic ' + base64.encode(Global.user_name + ":" + Global.password)
            },
            body: JSON.stringify(request_body)
        })
        .then(response => {
            return response.json();
        })
        .then(async data => {
            this.props.navigation.navigate("OpenCase");
        })
        .catch(function(error) {
            Alert.alert('Warning!', "Netework error");
        });
        this.setState({showIndicator: false})
    }

    showDateTimePicker = () => {
        this.setState({ isDateTimePickerVisible: true });
    };

    hideDateTimePicker = () => {
        this.setState({ isDateTimePickerVisible: false });
    };

    handleDatePicked = date => {
        // console.warn("A date has been picked: ", date);
        this.setState({
            case_date: date,
            case_date_string: moment(date).format("MMMM DD YYYY")
        });
        this.hideDateTimePicker();
    };

    set_body_part = data => {
        this.setState(data);
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
                    <TouchableOpacity onPress = {() => this.props.navigation.navigate("OpenCase")}>
                        <Image style = {{width: 20, height: 20}} resizeMode = {'contain'} source={require('../assets/images/menu_back_arrow.png')}/>
                    </TouchableOpacity>
                </View>
                <View style = {{width: '40%', height: '100%', justifyContent: 'center'}}>
                    <Text style = {{fontSize: 18, color: '#ffffff'}}>New Cases</Text>
                </View>
                <View style = {{width: '40%', height: '100%', justifyContent: 'flex-end', alignItems: 'center', flexDirection: 'row'}}>
                    <TouchableOpacity style = {{marginRight: 15}} onPress = {() => this.save_newcase()}>
                        <Image style = {{width: 30, height: 30}} resizeMode = {'contain'} source={require('../assets/images/save_newcase.png')}/>
                    </TouchableOpacity>
                    <TouchableOpacity style = {{marginRight: 15}} onPress = {() => this.props.navigation.navigate("OpenCase")}>
                        <Image style = {{width: 30, height: 30}} resizeMode = {'contain'} source={require('../assets/images/cancel_newcase.png')}/>
                    </TouchableOpacity>
                </View>
            </View>
            <View style = {{width: '100%', height: main_view_height, alignItems: 'center'}}>
                <KeyboardAwareScrollView style = {{width: '90%'}}>
                    <View style = {styles.component_view} onStartShouldSetResponder={() => this.showDateTimePicker()}>
                        <View style = {styles.component_title_view}>
                            <Text style = {styles.component_title_text}>Case Date</Text>
                        </View>
                        <View style = {styles.component_content_view}>
                            <Text style = {styles.component_content_text}>{this.state.case_date_string}</Text>
                        </View>
                    </View>
                    <DateTimePicker
                        datePickerModeAndroid = {"calendar"}
                        isVisible={this.state.isDateTimePickerVisible}
                        onConfirm={this.handleDatePicked}
                        onCancel={this.hideDateTimePicker}
                        // minimumDate = {new Date()}
                        date = {this.state.case_date_string == "" ? new Date() : this.state.case_date}
                    />
                    <View style = {styles.component_view} onStartShouldSetResponder={() => this.props.navigation.navigate("SelectBodyPart", {set_body_part: this.set_body_part, bodypart_list: this.state.bodypart_list})}>
                        <View style = {styles.component_title_view}>
                            <Text style = {styles.component_title_text}>Select Body Part</Text>
                        </View>
                        <View style = {styles.component_content_view}>
                        {
                            this.state.selected_body_part != null &&
                            <Text style = {styles.component_content_text}>{this.state.selected_body_part.partName}</Text>
                        }
                        {
                            this.state.selected_body_part == null &&
                            <Text style = {styles.component_content_text}> </Text>
                        }
                        </View>
                    </View>
                    <View style = {styles.component_view}>
                        <View style = {styles.component_title_view}>
                            <Text style = {styles.component_title_text}>Brief Description</Text>
                        </View>
                        <View style = {styles.component_content_view}>
                            <TextInput style = {[styles.component_content_text, {padding: 0}]} multiline = {true} onChangeText = {(text) => this.setState({brief_desc: text})}>{this.state.brief_desc}</TextInput>
                        </View>
                    </View>
                </KeyboardAwareScrollView>
            </View>
        </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fafafa',
        // alignItems: 'center'
    },
    menu_bar: {
        width: '100%',
        height: menu_bar_height,
        backgroundColor: '#445774',
        flexDirection: 'row'
    },
    component_view: {
        width: '100%',
        marginTop: 10
    },
    component_title_view: {
        width: '100%'
    },
    component_title_text: {
        fontSize: 12,
        color: '#808080'
    },
    component_content_view: {
        width: '100%',
        // height: 30,
        borderBottomColor: '#de9d73',
        borderBottomWidth: 1,
        justifyContent: 'flex-end',
        marginTop: 5
    },
    component_content_text: {
        fontSize: 16,
        color: '#000000'
    }
})