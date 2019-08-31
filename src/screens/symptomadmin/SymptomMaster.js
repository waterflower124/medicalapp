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
import Global from '../../utils/Global/Global'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { TextInput } from 'react-native-gesture-handler';
import DateTimePicker from "react-native-modal-datetime-picker";
import moment from 'moment';
import RadioForm from '../../utils/component/radiobutton/SimpleRadioButton'

YellowBox.ignoreWarnings(["Warning:"]);

var deviceWidth = Dimensions.get('window').width;
var deviceHeight = Dimensions.get('window').height;
var menu_bar_height = 70;
var safearea_height = deviceHeight - getInset('top') - getInset('bottom');
var main_view_height = Platform.OS == "ios" ? safearea_height - menu_bar_height : safearea_height - menu_bar_height - StatusBar.currentHeight;

var radio_props = [
    {label: 'Yes', value: 'Y' },
    {label: 'No', value: 'N' }
];

export default class SymptomMaster extends Component {
    static navigationOptions = {
        header: null,
        headerBackTitle: null,
	};

    constructor(props){
		super(props);

		this.state = {

            showIndicator: false,

            symptom_code: "",
            symptom_desc: "",
            synoyms_text: "",

		}
    }

    async UNSAFE_componentWillMount() {
        
    }

    componentDidMount() {
        this.props.navigation.addListener('willFocus', this.init_visit.bind(this));
    }

    init_visit = () => {
        this.setState({
            symptom_code: Global.symptom_admin_json.symptomCode,
            symptom_desc: Global.symptom_admin_json.symptomDesc,
            synoyms_text: Global.symptom_admin_json.symptomAlias,
        });
    }

    

    go_back() {
        this.props.navigation.navigate("Home");
    }

    select_symptom_code() {
        this.props.navigation.navigate("SelectSymptom", {prev_screen: "SymptomMaster"});
    }
    
    set_symonyms(text) {
        this.setState({
            synoyms_text: text
        });
        Global.symptom_admin_json.symptomAlias = text
    }

    save_case = async() => {
        if(Global.symptom_admin_json.symptom_code == "") {
            Alert.alert("Warning!", "Please select Symptom.");
            return;
        }

        this.setState({showIndicator: true});
        await fetch(Global.base_url + '/symptomref/' + Global.symptom_admin_json.id, {
            method: "PUT",
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Authorization': 'Basic ' + base64.encode(Global.user_name + ":" + Global.password)
            },
            body: JSON.stringify(Global.symptom_admin_json)
        })
        .then(response => {
            return response.json();
        })
        .then(async data => {
            Alert.alert('Success!', "Successfully Saved.");
        })
        .catch(function(error) {
            Alert.alert('Warning!', error.message);
        });
        this.setState({showIndicator: false});
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
                <View style = {{width: '60%', height: '100%', justifyContent: 'center'}}>
                    <Text style = {{fontSize: 18, color: '#ffffff'}}>Symptom Master</Text>
                </View>
                <View style = {{width: '20%', height: '100%', alignItems: 'flex-end', justifyContent: 'center'}}>
                    <TouchableOpacity style = {{marginRight: 15}} onPress = {() => this.save_case()}>
                        <Image style = {{width: 30, height: 30}} resizeMode = {'contain'} source={require('../../assets/images/save_newcase.png')}/>
                    </TouchableOpacity>
                </View>
            </View>
            <View style = {{width: '100%', height: main_view_height, alignItems: 'center'}}>
                <KeyboardAwareScrollView style = {{width: '90%'}}>
                    <View style = {styles.component_view} onStartShouldSetResponder={() => this.select_symptom_code()}>
                        <View style = {styles.component_title_view}>
                            <Text style = {styles.component_title_text}>Symptom Code</Text>
                        </View>
                        <View style = {[styles.component_content_view, {flexDirection: 'row'}]}>
                            <View style = {{width: '90%', height: '100%'}}>
                                <TextInput style = {[styles.component_content_text, {padding: 0}]} editable={false} pointerEvents="none" placeholder = {"Loinc Code"}>{this.state.symptom_code}</TextInput>
                            </View>
                            <View style = {{width: '10%', alignItems: 'center', justifyContent: 'center'}}>
                                <Image style = {{width: 20, height: 20}} resizeMode = {'contain'} source={require('../../assets/images/search_icon.png')}/>
                            </View>
                        </View>
                    </View>
                    <View style = {styles.component_view}>
                        <View style = {styles.component_title_view}>
                            <Text style = {styles.component_title_text}>Symptom Desc</Text>
                        </View>
                        <View style = {styles.component_content_view}>
                            <View style = {{width: '100%'}}>
                                <TextInput style = {[styles.component_content_text, {padding: 0}]} editable={false} pointerEvents="none" placeholder = {"Lab Desc"}>{this.state.symptom_desc}</TextInput>
                            </View>
                        </View>
                    </View>
                    <View style = {styles.component_view}>
                        <View style = {styles.component_title_view}>
                            <Text style = {styles.component_title_text}>Symonyms</Text>
                        </View>
                        <View style = {styles.component_content_view}>
                            <TextInput style = {[styles.component_content_text, {padding: 0}]} multiline = {true} placeholder = {'Symonyms'} onChangeText = {(text) => this.set_symonyms(text)}>{this.state.synoyms_text}</TextInput>
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
    },
    
})