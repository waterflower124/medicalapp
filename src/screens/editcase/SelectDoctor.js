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

YellowBox.ignoreWarnings(["Warning:"]);

var deviceWidth = Dimensions.get('window').width;
var deviceHeight = Dimensions.get('window').height;
var menu_bar_height = 70;
var safearea_height = deviceHeight - getInset('top') - getInset('bottom');
var main_view_height = Platform.OS == "ios" ? safearea_height - menu_bar_height : safearea_height - menu_bar_height - StatusBar.currentHeight;

export default class SelectHospital extends Component {
    static navigationOptions = {
        header: null,
        headerBackTitle: null,
	};

    constructor(props){
		super(props);

		this.state = {

            showIndicator: false,

            prev_screen: props.navigation.state.params.prev_screen,
            doctor_list: [],
            global_doctor_list: [],

            add_doctor_modal_show: false,
            full_name: '',
            specialty: '',
            phone: '',
            email: '',
            
		}
    }

    async UNSAFE_componentWillMount() {
        this.setState({showIndicator: true})
        await fetch(Global.base_url + '/doctor')
        .then(response => response.json())
        .then(async data => {
            this.setState({
                doctor_list: data,
                global_doctor_list: data
            });
        })
        .catch(function(error) {
            Alert.alert('Warning!', error.message);
        });
        this.setState({showIndicator: false})
    }

    go_back() {
        if(this.state.prev_screen == "VisitMaster") {
            this.props.navigation.navigate("VisitMaster");
        } else if(this.state.prev_screen == "Referal") {
            this.props.navigation.navigate("Referal");
        }
    }

    select_doctor(item) {
        if(this.state.prev_screen == "VisitMaster") {
            Global.edit_case_json.doctorName = item.doctorName;
            Global.edit_case_json.specialty = item.specialty;
            this.props.navigation.navigate("VisitMaster");
        } else if(this.state.prev_screen == "Referal") {
            Global.edit_case_json.refDoctor = item.doctorName;
            Global.edit_case_json.refSpecialty = item.specialty;
            this.props.navigation.navigate("Referal");
        }
    }

    search_doctor = (text) => {
        var global_doctor_list = this.state.global_doctor_list;
        var doctor_list = [];
        for(i = 0; i < global_doctor_list.length; i ++) {
            if(global_doctor_list[i].doctorName.indexOf(text) > -1) {
                doctor_list.push(global_doctor_list[i]);
            }
        }
        this.setState({
            doctor_list: doctor_list
        })
    }

    add_new_doctor = async() => {
        if(this.state.full_name == "") {
            Alert.alert("Warning!", "Doctor name is required. Please input doctor name.");
            return;
        }
        if(this.state.specialty == "") {
            Alert.alert("Warning!", "Specialty is required. Please input dspecialty.");
            return;
        }
        this.setState({
            add_doctor_modal_show: false
        });
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
                <View style = {{width: '80%', height: '100%', justifyContent: 'center'}}>
                    <Text style = {{fontSize: 18, color: '#ffffff'}}>Select Doctor</Text>
                </View>

            </View>
            <View style = {{width: '100%', height: main_view_height, alignItems: 'center'}}>
                <View style = {{width: '95%', height: 40, borderColor: '#000000', borderWidth: 1, flexDirection: 'row', marginTop: 10}}>
                    <View style = {{width: '80%', height: '100%'}}>
                        <TextInput style = {styles.search_input_text} placeholder = {'Search Doctor'} onChangeText = {(text) => this.search_doctor(text)}></TextInput>
                    </View>
                    <View style = {{width: '20%', height: '100%', justifyContent: 'center', alignItems: 'flex-end'}}>
                        <Image style = {{width: 20, height: 20, marginRight: 10}} resizeMode = {'contain'} source={require('../../assets/images/search_icon.png')}/>
                    </View>
                </View>
                <View style = {{width: '95%', height: main_view_height - 40 - 10}}>
                    <ScrollView style = {{width: '100%'}}>
                    {
                        this.state.doctor_list.map((item, index) => 
                        <TouchableOpacity key = {index} style = {styles.component_view} onPress = {() => this.select_doctor(item)}>
                            <Text style = {styles.component_content_text} multiline = {true}>{item.doctorName} - {item.specialty}</Text>
                        </TouchableOpacity>
                        )
                    }
                    </ScrollView>
                </View>
                <TouchableOpacity style = {styles.add_button} onPress = {() => this.setState({add_doctor_modal_show: true})}>
                    <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source={require('../../assets/images/new_case_add.png')}/>
                </TouchableOpacity>
            {
                this.state.add_doctor_modal_show &&
                <View style = {{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black', opacity: 0.3, zIndex: 50}}></View>
            }
            {
                this.state.add_doctor_modal_show &&
                <View style = {{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: 100}}>
                    <View style = {styles.modal_view}>
                        <View style = {styles.modal_title_view}>
                            <Text style = {styles.modal_title_text}>Enter Doctor Name</Text>
                        </View>
                        <View style = {styles.modal_content_view}>
                            <View style = {styles.modal_component_view}>
                                <View style = {styles.modal_component_title_view}>
                                    <Text style = {styles.modal_component_title_text}>Full Name</Text>
                                </View>
                                <View style = {styles.modal_component_input_view}>
                                    <TextInput style = {styles.modal_component_input_text} onChangeText = {(text) => this.setState({full_name: text})}></TextInput>
                                </View>
                            </View>
                            <View style = {styles.modal_component_view}>
                                <View style = {styles.modal_component_title_view}>
                                    <Text style = {styles.modal_component_title_text}>Specialty</Text>
                                </View>
                                <View style = {styles.modal_component_input_view}>
                                    <TextInput style = {styles.modal_component_input_text} onChangeText = {(text) => this.setState({specialty: text})}></TextInput>
                                </View>
                            </View>
                            <View style = {styles.modal_component_view}>
                                <View style = {styles.modal_component_title_view}>
                                    <Text style = {styles.modal_component_title_text}>Phone</Text>
                                </View>
                                <View style = {styles.modal_component_input_view}>
                                    <TextInput style = {styles.modal_component_input_text} keyboardType = {'phone-pad'} onChangeText = {(text) => this.setState({phone: text})}></TextInput>
                                </View>
                            </View>
                            <View style = {styles.modal_component_view}>
                                <View style = {styles.modal_component_title_view}>
                                    <Text style = {styles.modal_component_title_text}>Email</Text>
                                </View>
                                <View style = {styles.modal_component_input_view}>
                                    <TextInput style = {styles.modal_component_input_text} onChangeText = {(text) => this.setState({email: text})}></TextInput>
                                </View>
                            </View>
                            <View style = {[styles.modal_component_view, {justifyContent: 'space-around', alignItems: 'center', flexDirection: 'row'}]}>
                                <TouchableOpacity style = {styles.modal_button} onPress = {() => this.setState({add_doctor_modal_show: false})}>
                                    <Text style = {styles.modal_title_text}>CANCEL</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style = {styles.modal_button} onPress = {() => this.add_new_doctor()}>
                                    <Text style = {styles.modal_title_text}>OK</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            }
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
    search_input_text: {
        width: '100%',
        height: '100%',
        padding: 0,
        paddingLeft: 10
    },
    component_view: {
        width: '100%',
        // height: 40,
        justifyContent: 'center',
        paddingLeft: 10,
        marginTop: 20
    },
    component_content_text: {
        fontSize: 16,
        color: '#000000'
    },
    add_button: {
        width: 40,
        height: 40,
        position: 'absolute',
        right: 20,
        bottom: 20,
        borderRadius: 40
    },
    modal_view: {
        width: '80%',
        height: 400,
        alignItems: 'center',
        backgroundColor: '#ffffff'
    },
    modal_title_view: {
        width: '100%', 
        height: 50, 
        justifyContent: 'center', 
        paddingLeft: 20,
        backgroundColor: '#445774'
    },
    modal_title_text: {
        fontSize: 16,
        color: '#ffffff'
    },
    modal_content_view: {
        width: '95%',
        height: 350
    },
    modal_component_view: {
        width: '100%',
        height: 70
    },
    modal_component_title_view: {
        width: '100%',
        height: 30,
        paddingLeft: 5,
        justifyContent: 'center'
    },
    modal_component_title_text: {
        fontSize: 16,
        color: '#000000'
    },
    modal_component_input_view: {
        width: '100%',
        height: 40,
        borderColor: '#000000',
        borderWidth: 1
    },
    modal_component_input_text: {
        width: '100%',
        height: '100%',
        padding: 5,
        fontSize: 16,
        color: '#000000'
    },
    modal_button: {
        width: '45%', 
        height: 40, 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: '#445774'
    }
})