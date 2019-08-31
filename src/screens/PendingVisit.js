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
  Alert
} from 'react-native';

import {getInset} from 'react-native-safe-area-view'
const base64 = require('base-64');
import { SkypeIndicator } from 'react-native-indicators';
import Global from '../utils/Global/Global'

YellowBox.ignoreWarnings(["Warning:"]);

var deviceWidth = Dimensions.get('window').width;
var deviceHeight = Dimensions.get('window').height;
var menu_bar_height = 70;
var safearea_height = deviceHeight - getInset('top') - getInset('bottom');
var main_view_height = Platform.OS == "ios" ? safearea_height - menu_bar_height : safearea_height - menu_bar_height - StatusBar.currentHeight;

var item_y_pos_array = [];

export default class PendingVisit extends Component {
    static navigationOptions = {
        header: null,
        headerBackTitle: null,
	};

    constructor(props){
		super(props);

		this.state = {

            showIndicator: false,
            prev_screen: props.navigation.state.params.prev_screen,
            caseNumber: props.navigation.state.params.caseNumber,

            json_array: [],
            right_menu_clicked: false,
            visitStatus: '',

            add_new_button_click: false,

            selected_right_menu_index: -1
		}
    }

    async UNSAFE_componentWillMount() {
        
    }

    componentDidMount() {
        this.props.navigation.addListener('willFocus', this.init_visit.bind(this));
    }

    init_visit = async() => {
        var visitStatus = "";
        if(this.state.prev_screen == "Home") {
            visitStatus = "P";
            this.setState({
                visitStatus: "P"
            })
        } else {
            visitStatus = "V";
            this.setState({
                visitStatus: "V"
            })
        }
        this.setState({showIndicator: true});
        await fetch(Global.base_url + '/visitproxy?userName=' + Global.profile_user_name + '&caseNumber=' + this.state.caseNumber + '&visitStatus=' + visitStatus, {
            method: 'GET',
            headers: {
                'Authorization': 'Basic ' + base64.encode(Global.user_name + ":" + Global.password)
            }
        })
        .then(response => response.json())
        .then(async data => {
            var json_array = data;
            for(i = 0; i < json_array.length; i ++) {
                json_array[i]["clicked"] = false;
            }
            this.setState({
                json_array: json_array
            });
        })
        .catch(function(error) {
            Alert.alert('Warning!', error.message);
        });
        this.setState({showIndicator: false});
    }

    go_prev_screen() {
        if(this.state.prev_screen == "Home") {
            this.props.navigation.navigate("Home");
        } else if(this.state.prev_screen == "OpenCase") {
            this.props.navigation.navigate("OpenCase");
        } else if(this.state.prev_screen == "CloseCase") {
            this.props.navigation.navigate("CloseCase");
        }
    }

    onLayoutEvent(layout) {
        const {x, y, width, height} = layout;
        item_y_pos_array.push(height);
    }

    right_menu_view_style = function() {
        var top_pos = 40;
        for(i = 0; i < this.state.selected_right_menu_index; i ++) {
            top_pos += item_y_pos_array[i] + 20;
        }
        if(this.state.prev_screen == "Home" || this.state.prev_screen == "CloseCase") {
            return {
                width: 150,
                height: 50,
                position: 'absolute',
                top: top_pos,
                right: 0,
                borderWidth: 1,
                borderColor: '#c0c0c0',
                backgroundColor: '#ffffff',
                paddingLeft: 10,
                zIndex: 1000
            }
        } else {
            if(this.state.json_array[this.state.selected_right_menu_index].visitType == "M") {
                return {
                    width: 150,
                    height: 100,
                    position: 'absolute',
                    top: top_pos,
                    right: 0,
                    borderWidth: 1,
                    borderColor: '#c0c0c0',
                    backgroundColor: '#ffffff',
                    paddingLeft: 10,
                    zIndex: 1000
                }
            }
            if(this.state.json_array[this.state.selected_right_menu_index].visitType == "I") {
                return {
                    width: 150,
                    height: 150,
                    position: 'absolute',
                    top: top_pos,
                    right: 0,
                    borderWidth: 1,
                    borderColor: '#c0c0c0',
                    backgroundColor: '#ffffff',
                    paddingLeft: 10,
                    zIndex: 1000
                }
            }
            if(this.state.json_array[this.state.selected_right_menu_index].visitType == "P") {
                return {
                    width: 150,
                    height: 50,
                    position: 'absolute',
                    top: top_pos,
                    right: 0,
                    borderWidth: 1,
                    borderColor: '#c0c0c0',
                    backgroundColor: '#ffffff',
                    paddingLeft: 10,
                    zIndex: 1000
                }
            }
            return {
                width: 150,
                height: 200,
                position: 'absolute',
                top: top_pos,
                right: 0,
                borderWidth: 1,
                borderColor: '#c0c0c0',
                backgroundColor: '#ffffff',
                paddingLeft: 10,
                zIndex: 1000
            }
        }
    }

    select_right_menu = (index) => {
        this.setState({
            selected_right_menu_index: index
        })
        var json_array = this.state.json_array;
        for(i = 0; i < json_array.length; i ++) {
            if(i == index) {
                json_array[i].clicked = !json_array[i].clicked;
            } else {
                json_array[i].clicked = false;
            }
        }
        this.setState({
            json_array: json_array,
            right_menu_clicked: !this.state.right_menu_clicked
        });
    }

    hidden_right_menu = () => {
        var json_array = this.state.json_array;
        for(i = 0; i < json_array.length; i ++) {
            json_array[i].clicked = false;
        }
        this.setState({
            json_array: json_array,
            right_menu_clicked: false,
            add_new_button_click: false,
        });
    }

    delete_alert = async() => {
        this.hidden_right_menu();
        Alert.alert('Notice!', 'Do you really delete this item?',
        [
            {text: 'Cancel', onPress: null},
            {text: 'OK', onPress: () => this.delete_pending(this.state.selected_right_menu_index)},
        ],
        { cancelable: true })
    };

    delete_pending = async(index) => {

        var item = this.state.json_array[index];

        this.setState({showIndicator: true})
        await fetch(Global.base_url + '/visit/' + item.id, {
            method: "DELETE",
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Authorization': 'Basic ' + base64.encode(Global.user_name + ":" + Global.password)
            },
        })
        // .then(response => response.json())
        .then(async data => {
            var json_array = this.state.json_array;
            json_array.splice(index, 1);
            this.setState({
                json_array: json_array
            });
        })
        .catch(function(error) {
            Alert.alert('Warning!', "Network error");
        });
        this.setState({showIndicator: false})
    }

    visit_master = (item) => {
        if(this.state.right_menu_clicked) {
            this.hidden_right_menu()
        } else {
            this.setState({
                add_new_button_click: false
            })
            for(i = 0; i < item.symptoms.length; i ++) {
                item.symptoms[i]["clicked"] = false;
            }
            for(i = 0; i < item.diagnoses.length; i ++) {
                item.diagnoses[i]["clicked"] = false;
            }
            for(i = 0; i < item.meds.length; i ++) {
                item.meds[i]["clicked"] = false;
            }
            for(i = 0; i < item.labs.length; i ++) {
                item.labs[i]["clicked"] = false;
            }
            for(i = 0; i < item.risks.length; i ++) {
                item.risks[i]["clicked"] = false;
            }
            for(i = 0; i < item.alternatives.length; i ++) {
                item.alternatives[i]["clicked"] = false;
            }
            for(i = 0; i < item.instructions.length; i ++) {
                item.instructions[i]["clicked"] = false;
            }
            for(i = 0; i < item.prodiags.length; i ++) {
                item.prodiags[i]["clicked"] = false;
            }
            if(this.state.prev_screen == "Home") {
                item.src_type = "Home";
            } else if(this.state.prev_screen == "OpenCase") {
                item.src_type = "OpenCase";
            }
            Global.edit_case_json = item;
            Global.visitStatus = this.state.visitStatus;
            this.props.navigation.navigate("VisitMaster");
        }
    }

    alternate_opinion() {
        this,this.hidden_right_menu();
        this.setState({
            add_new_button_click: false
        })
        Global.edit_case_json = {
            alternatives: [],
            caseNumber: this.state.caseNumber,
            comments: "",
            diagnoses: [],
            doctorName: "",
            hospitalName: "",
            id: 0,
            instructions: [],
            labs: [],
            meds: [],
            nextVisitDate: "",
            onlineRec: "N",
            paperRec: "N",
            procAlias: "",
            procCode: "",
            procComments: "",
            procDate: "",
            procName: "",
            procResults: "P",
            procStatus: "P",
            prodiags: [],
            refComments: "",
            refDate: "",
            refDoctor: "",
            refHospital: "",
            refSpecialty: "",
            risks: [],
            specialty: "",
            successRate: 0,
            symptoms: [],
            userName: Global.profile_user_name,
            visitDate: "",
            visitStatus: "V",
            visitType: "",

            src_type: "Alternative"
        }
        Global.visitStatus = "";
        this.props.navigation.navigate("VisitMaster");
    }

    main_doctor_visit() {
        this,this.hidden_right_menu();
        this.setState({
            add_new_button_click: false
        })
        Global.edit_case_json = {
            alternatives: [],
            caseNumber: this.state.caseNumber,
            comments: "",
            diagnoses: [],
            hospitalName: this.props.navigation.state.params.hospitalName,
            doctorName: this.props.navigation.state.params.doctorName,
            id: 0,
            instructions: [],
            labs: [],
            meds: [],
            nextVisitDate: "",
            onlineRec: "N",
            paperRec: "N",
            procAlias: "",
            procCode: "",
            procComments: "",
            procDate: "",
            procName: "",
            procResults: "P",
            procStatus: "P",
            prodiags: [],
            refComments: "",
            refDate: "",
            refDoctor: "",
            refHospital: "",
            refSpecialty: "",
            risks: [],
            specialty: "",
            successRate: 0,
            symptoms: [],
            userName: Global.profile_user_name,
            visitDate: "",
            visitStatus: "V",
            visitType: "",

            src_type: "Main Doctor"
        }
        Global.visitStatus = "";
        this.props.navigation.navigate("VisitMaster");
    }

    donotuseopinion = async() => {
        this.hidden_right_menu();
        var item = this.state.json_array[this.state.selected_right_menu_index];
        if(this.state.json_array[this.state.selected_right_menu_index].visitType == "I") {
            item.visitType = "S";
        } else if(this.state.json_array[this.state.selected_right_menu_index].visitType == "S") {
            item.visitType = "I";
        }
        
        this.setState({showIndicator: true})
        await fetch(Global.base_url + '/visitproxy/' + item.id, {
            method: "PUT",
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Authorization': 'Basic ' + base64.encode(Global.user_name + ":" + Global.password)
            },
            body: JSON.stringify(item)
        })
        .then(async data => {
            // var json_array = this.state.json_array;
            // json_array.splice(index, 1);
            // this.setState({
            //     json_array: json_array
            // });
            await this.init_visit();
        })
        .catch(function(error) {
            Alert.alert('Warning!', "Network error");
        });
        this.setState({showIndicator: false})
    }

    setasmaindoctor = async() => {
        this.hidden_right_menu();
        var item = this.state.json_array[this.state.selected_right_menu_index];
        item.visitType = "M";
        this.setState({showIndicator: true})
        await fetch(Global.base_url + '/visitproxy/' + item.id, {
            method: "PUT",
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Authorization': 'Basic ' + base64.encode(Global.user_name + ":" + Global.password)
            },
            body: JSON.stringify(item)
        })
        .then(async data => {
            // var json_array = this.state.json_array;
            // json_array.splice(index, 1);
            // this.setState({
            //     json_array: json_array
            // });
            await this.init_visit();
        })
        .catch(function(error) {
            Alert.alert('Warning!', "Network error");
        });
        this.setState({showIndicator: false})

    }

    recordping = async() => {
        this.hidden_right_menu();
        Alert.alert("EpationIndex", "Record Ping: " + this.state.json_array[this.state.selected_right_menu_index].caseNumber + " - " + this.state.json_array[this.state.selected_right_menu_index].id);
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
                    <TouchableOpacity onPress = {() => this.go_prev_screen()}>
                        <Image style = {{width: 20, height: 20}} resizeMode = {'contain'} source={require('../assets/images/menu_back_arrow.png')}/>
                    </TouchableOpacity>
                </View>
                <View style = {{width: '60%', height: '100%', justifyContent: 'center'}}>
                    <Text style = {{fontSize: 18, color: '#ffffff'}}>{(this.state.prev_screen == "Home" || this.state.prev_screen == "CloseCase") ? "Pending Visits" : "Doctor Visits"}</Text>
                </View>
                <View style = {{width: '20%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
                    <TouchableOpacity onPress = {() => this.props.navigation.navigate("Home")}>
                        <Image style = {{width: 30, height: 30}} resizeMode = {'contain'} source={require('../assets/images/right_home.png')}/>
                    </TouchableOpacity>
                </View>
            </View>
            <View style = {{width: '100%', height: main_view_height, alignItems: 'center'}} onStartShouldSetResponder={() => this.hidden_right_menu()}>
                <ScrollView style = {{width: '90%'}} showsVerticalScrollIndicator = {false}>
                    <View style = {{paddingBottom: 320}}>
                    {
                        this.state.json_array.map((item, index) => 
                        <TouchableOpacity key = {index} style = {[styles.item_view, {zIndex: 1000-index}]} onPress = {() => this.visit_master(item)} onLayout = {(event) => {this.onLayoutEvent(event.nativeEvent.layout)}}>
                            <View style = {{width: '100%', height: '50%', flexDirection: 'row'}}>
                                <View style = {styles.item_text_view}>
                                    <Text style = {styles.item_text}>{item.visitDate}</Text>
                                    <Text style = {styles.item_text}> ({item.caseNumber}-{item.id})</Text>
                                </View>
                                <View style = {styles.item_icon_view}>
                                    <TouchableOpacity onPress = {() => this.select_right_menu(index)}>
                                        <Image style = {{width: 30, height: 20}} resizeMode = {'contain'} source={require('../assets/images/pending_lab_menu_right.png')}/>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style = {{width: '100%', height: '50%', flexDirection: 'row'}}>
                                <View style = {styles.item_text_view}>
                                    <Text style = {styles.item_text}>{item.doctorName}</Text>
                                </View>
                                <TouchableOpacity style = {styles.item_icon_view} onPress = {() => this.select_right_menu(index)}>
                                {
                                    item.visitType == "M" &&
                                    <View style = {[styles.circle_view, {backgroundColor: '#ff0000'}]} >
                                        <Text style = {{fontSize: 16, color: '#ffffff'}}>{item.visitType}</Text>
                                    </View>
                                }
                                {
                                    item.visitType == "I" &&
                                    <View style = {[styles.circle_view, {backgroundColor: '#000000'}]} >
                                        <Text style = {{fontSize: 16, color: '#ffffff'}}>{item.visitType}</Text>
                                    </View>
                                }
                                {
                                    item.visitType == "S" &&
                                    <View style = {[styles.circle_view, {backgroundColor: '#00ff00'}]} >
                                        <Text style = {{fontSize: 16, color: '#ffffff'}}>{item.visitType}</Text>
                                    </View>
                                }
                                {
                                    item.visitType == "P" &&
                                    <View style = {[styles.circle_view, {backgroundColor: '#0000ff'}]} >
                                        <Text style = {{fontSize: 16, color: '#ffffff'}}>{item.visitType}</Text>
                                    </View>
                                }
                                {
                                    item.visitType == "R" &&
                                    <View style = {[styles.circle_view, {backgroundColor: '#ff7f00'}]} >
                                        <Text style = {{fontSize: 16, color: '#ffffff'}}>{item.visitType}</Text>
                                    </View>
                                }
                                {
                                    item.visitType == "F" &&
                                    <View style = {[styles.circle_view, {backgroundColor: '#e040fb'}]} >
                                        <Text style = {{fontSize: 16, color: '#ffffff'}}>{item.visitType}</Text>
                                    </View>
                                }
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                        )
                    }
                    {
                        this.state.right_menu_clicked &&
                        <View style = {this.right_menu_view_style()}>
                            <TouchableOpacity style = {styles.right_menu_item_view} onPress = {() => this.delete_alert()}>
                                <Text style = {styles.right_menu_text}>Delete</Text>
                            </TouchableOpacity>
                        {
                            this.state.prev_screen != "Home" && this.state.prev_screen != "CloseCase" && this.state.json_array[this.state.selected_right_menu_index].visitType != "P" &&
                            <View>
                            {
                                this.state.json_array[this.state.selected_right_menu_index].visitType != "M" && 
                                <TouchableOpacity style = {styles.right_menu_item_view} onPress = {() => this.donotuseopinion()}>
                                    <Text style = {styles.right_menu_text}>{this.state.json_array[this.state.selected_right_menu_index].visitType != "I" ? "Do not use opinion" : "Use opinion"}</Text>
                                </TouchableOpacity>
                            }
                            {
                                this.state.json_array[this.state.selected_right_menu_index].visitType != "M" && this.state.json_array[this.state.selected_right_menu_index].visitType != "I" &&
                                <TouchableOpacity style = {styles.right_menu_item_view} onPress = {() => this.setasmaindoctor()}>
                                    <Text style = {styles.right_menu_text}>Set as main doctor</Text>
                                </TouchableOpacity>
                            }
                                <TouchableOpacity style = {styles.right_menu_item_view} onPress = {() => this.recordping()}>
                                    <Text style = {styles.right_menu_text}>Record Ping</Text>
                                </TouchableOpacity>
                            </View>
                        }
                        </View>
                    }
                    </View>
                </ScrollView>
            {
                this.state.prev_screen == "OpenCase" &&
                <View style = {[styles.add_new_view, this.state.add_new_button_click ? (this.state.json_array.length == 0 ? {height: 100} : {height: 150}) : {height: 50}]}>
                {
                    this.state.add_new_button_click &&
                    <View style = {[{width: '100%'}, this.state.json_array.length == 0 ? {height: 50} : {height: 100}]}>
                        <TouchableOpacity style = {styles.alternative_button} onPress = {() => this.alternate_opinion()}>
                            <View style = {{width: '70%', height: '60%', backgroundColor: '#3a393a', justifyContent: 'center', alignItems: 'center', borderRadius: 5}}>
                                <Text style = {{fontSize: 13, color: '#ffffff'}}>{this.state.json_array.length == 0 ? "Doctor Visit" : "Alternate Opinion"}</Text>
                            </View>
                            <View style = {{width: '30%', height: '60%', justifyContent: 'center', alignItems: 'flex-end'}}>
                                <Image style = {{height: '100%', aspectRatio: 1}} resizeMode = {'contain'} source={require('../assets/images/new_case_button.png')}/>
                            </View>
                        </TouchableOpacity>
                    {
                        this.state.json_array.length != 0 &&
                        <TouchableOpacity style = {styles.alternative_button} onPress = {() => this.main_doctor_visit()}>
                            <View style = {{width: '70%', height: '60%', backgroundColor: '#3a393a', justifyContent: 'center', alignItems: 'center', borderRadius: 5}}>
                                <Text style = {{fontSize: 13, color: '#ffffff'}}>Main Doctor Visit</Text>
                            </View>
                            <View style = {{width: '30%', height: '60%', justifyContent: 'center', alignItems: 'flex-end'}}>
                                <Image style = {{height: '100%', aspectRatio: 1}} resizeMode = {'contain'} source={require('../assets/images/new_case_button.png')}/>
                            </View>
                        </TouchableOpacity>
                    }
                    </View>
                }
                    <View style = {[{width: '100%', height: 50, justifyContent: 'center', alignItems: 'flex-end'}]}>
                        <TouchableOpacity style = {styles.add_new_button} onPress = {() => this.setState({add_new_button_click: !this.state.add_new_button_click, right_menu_clicked: false})}>
                        {
                            this.state.add_new_button_click &&
                            <Image style = {{height: '100%'}} resizeMode = {'contain'} source={require('../assets/images/new_case_cancel.png')}/>
                        }
                        {
                            !this.state.add_new_button_click &&
                            <Image style = {{height: '100%'}} resizeMode = {'contain'} source={require('../assets/images/new_case_add.png')}/>
                        }
                        </TouchableOpacity>
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
    item_view: {
        width: '100%', 
        height: 80, 
        marginTop: 20,
        borderColor: '#c0c0c0',
        borderWidth: 1
    },
    item_text_view: {
        width: '70%',
        height: '100%',
        alignItems: 'center',
        paddingLeft: 10,
        flexDirection: "row"
    },
    item_text: {
        fontSize: 16,
        color: '#000000'
    },
    item_icon_view: {
        width: '30%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingRight: 10
    },
    circle_view: {
        width: 20, 
        height: 20, 
        borderRadius: 20, 
        justifyContent: 'center', 
        alignItems: 'center'
    },
    right_menu_view: {
        width: 150,
        height: 50,
        position: 'absolute',
        top: 40,
        right: 0,
        borderWidth: 1,
        borderColor: '#c0c0c0',
        backgroundColor: '#ffffff',
        paddingLeft: 10
    },
    right_menu_item_view: {
        width: 150,
        height: 50,
        justifyContent: 'center',
    },
    right_menu_text: {
        fontSize: 14,
        color: '#000000'
    },

    add_new_view: {
        width: 180,
        position: 'absolute',
        right: (deviceWidth - 40) / 2,
        bottom: 20,
        zIndex: 1000
    },
    add_new_button: {
        width: 40,
        height: 40,
        borderRadius: 40
    },
    alternative_button: {
        width: '100%',
        height: 50,
        flexDirection: 'row',
        alignItems: 'center'
    },
})