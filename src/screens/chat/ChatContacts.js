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

import { TextInput } from 'react-native-gesture-handler';
import {getInset} from 'react-native-safe-area-view'
const base64 = require('base-64');
import { SkypeIndicator } from 'react-native-indicators';
import Global from '../../utils/Global/Global';
import firebaseApp from "../../utils/Global/firebaseConfig";

YellowBox.ignoreWarnings(["Warning:"]);

var deviceWidth = Dimensions.get('window').width;
var deviceHeight = Dimensions.get('window').height;
var menu_bar_height = 70;
var tabbar_height = 40;
var safearea_height = deviceHeight - getInset('top') - getInset('bottom');
var main_view_height = Platform.OS == "ios" ? safearea_height - menu_bar_height - tabbar_height : safearea_height - menu_bar_height - tabbar_height - StatusBar.currentHeight;

export default class ScoreFacotrs extends Component {
    static navigationOptions = {
        header: null,
        headerBackTitle: null,
	};

    constructor(props){
		super(props);

		this.state = {

            showIndicator: false,
            show_right_menu_view: false,

            diagnose_list: [],
            prev_screen: props.navigation.state.params.prev_screen,

            search_view_bool: false,
            search_text: "",
            selected_chat_tab: "group", //recent, private, group, add

            chat_recent_list: [],//// recent chat list
            chat_request_list: [],

            chat_request_id: '',
		}
    }

    async UNSAFE_componentWillMount() {
        this.get_group_contacts()
    }

    componentDidMount() {
        // this.props.navigation.addListener('willFocus', this.init_contacts.bind(this));
    }

    get_group_contacts = async() => {
        this.setState({showIndicator: true})
        await fetch(Global.base_url + '/diagnose/' + Global.user_name, {
            method: 'GET',
            headers: {
                'Authorization': 'Basic ' + base64.encode(Global.user_name + ":" + Global.password)
            }
        })
        .then(response => response.json())
        .then(async data => {
            var diagnose_list = [{
                "diagnoseDesc": "EpatientIndex",
                "diagnoseCode": "EpatientIndex",
            }];
            diagnose_list.push(...data);
            this.setState({
                diagnose_list: diagnose_list
            })
        })
        .catch(function(error) {
            Alert.alert('Warning!', "Network error");
        });
        this.setState({showIndicator: false})
    }

    get_recent_contact = async() => {
        // this.setState({showIndicator: true});
        // this.setState({
        //     recent_list: []
        // })
        // let dbRef = firebaseApp.database().ref('messages/group').child("EpatientIndex").orderByChild('created_at');
        // await dbRef.once('value').then (snapshot => {
        //     var recent_list = [];
        //     snapshot.forEach(item => {
        //         var name_exist = false;
        //         for(i = 0; i < recent_list.length; i ++) {
        //             name_exist = false;
        //             if(recent_list[i].from == item.val().from) {
        //                 name_exist = true;
        //                 break;
        //             }
        //         }
        //         if(!name_exist) {
        //             recent_list.push(item.val())
        //         }
        //     })
        //     this.setState({
        //         recent_list: recent_list
        //     })
        // })
        // this.setState({showIndicator: false});
        this.setState({showIndicator: true});
        await fetch(Global.base_url + '/chatmaster?userName=' + Global.user_name, {
            method: 'GET',
            headers: {
                'Authorization': 'Basic ' + base64.encode(Global.user_name + ":" + Global.password)
            }
        })
        .then(response => response.json())
        .then(async data => {
            var chat_recent_list = data.chatContacts;
            for(i = 0; i < chat_recent_list.length; i ++) {
                // chat_recent_list[i].avatar_url = "";
                // chat_recent_list[i].address = "test address";
                // chat_recent_list[i].status = "online";
                let dbRef = firebaseApp.database().ref('users/' + chat_recent_list[i].userContact).child("avatar_url");
                await dbRef.once('value', (value) => {
                    chat_recent_list[i].avatar_url = value.val();
                    chat_recent_list[i].status = "online";
                })
                
            }
            this.setState({
                chat_recent_list: chat_recent_list
            })
        })
        .catch(function(error) {
            Alert.alert('Warning!', error.message);
        });
        this.setState({showIndicator: false});
    }

    get_chat_request = async() => {
        this.setState({showIndicator: true});
        await fetch(Global.base_url + '/chatmaster?userName=' + Global.user_name, {
            method: 'GET',
            headers: {
                'Authorization': 'Basic ' + base64.encode(Global.user_name + ":" + Global.password)
            }
        })
        .then(response => response.json())
        .then(async data => {
            var chat_request_list = data.chatRequests;
            for(i = 0; i < chat_request_list.length; i ++) {
                let dbRef = firebaseApp.database().ref('users/' + chat_request_list[i].userContact).child("avatar_url");
                await dbRef.once('value', (value) => {
                    chat_request_list[i].avatar_url = value.val();
                })
            }
            this.setState({
                chat_request_list: chat_request_list
            })
        })
        .catch(function(error) {
            Alert.alert('Warning!', "Network error");
        });
        this.setState({showIndicator: false});
    }

    go_home() {
        if(this.state.prev_screen == "patient") {
            this.props.navigation.navigate("Home");
        } else {
            this.props.navigation.navigate("AdvocateHome");
        }
    }

    chat_search = async() => {
        if(this.state.search_view_bool) {
            this.setState({
                search_view_bool: false,
                search_text: ""
            })
        } else {
            this.setState({
                search_view_bool: true
            })
        }
    }

    searchSubmit = async() => {

    }

    select_chattab = async(selected_tab) => {
        this.setState({
            selected_chat_tab: selected_tab
        })
        if(selected_tab == "recent") {
            this.get_recent_contact();
        } else if(selected_tab == "private") {

        } else if(selected_tab == "group") {
            this.get_group_contacts();
        } else if(selected_tab == "add") {
            this.get_chat_request();
        }
    }

    chat_request_action() {
        this.setState({
            show_chat_request_view: !this.state.show_chat_request_view,
            show_right_menu_view: false
        })
    }

    chat_profile_action() {
        this.setState({
            show_right_menu_view: false
        })
        this.props.navigation.navigate("ChatProfile");
    }

    chat_request_button_action = async(button_type) => {
        if(button_type == "ok") {
            this.setState({showIndicator: true})
            await fetch(Global.base_url + '/chatmaster/friend', {
                method: 'POST',
                headers: {
                    'Authorization': 'Basic ' + base64.encode(Global.user_name + ":" + Global.password)
                },
                body: JSON.stringify({
                    id: 0,
                    userContact: Global.user_name,
                    userName: this.state.chat_request_id
                })
            })
            .then(response => response.json())
            .then(async data => {
                Alert.alert('EpatientIndex', "Your request sent successfully.");
            })
            .catch(function(error) {
                Alert.alert('Warning!', "Network error.");
            });
            this.setState({showIndicator: false})
        } 
        this.setState({
            chat_request_id: '',
            show_chat_request_view: false
        })
    }

    request_accept = async(accept_type, index) => {
        var url = "";
        if(accept_type == "accept") {
            url = Global.base_url + '/chatmaster';
        } else if(accept_type == "reject") {
            url = Global.base_url + '/chatmaster/ignore';
        }

        this.setState({showIndicator: true})
        await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + base64.encode(Global.user_name + ":" + Global.password)
            },
            body: JSON.stringify({
                id: 0,
                userContact: Global.user_name,
                userName: this.state.chat_request_id
            })
        })
        .then(response => response.json())
        .then(async data => {
            var chat_request_list = this.state.chat_request_list;
            chat_request_list.splice(index, i);
            this.setState({
                chat_request_list: chat_request_list
            })
        })
        .catch(function(error) {
            Alert.alert('Warning!', "Network error");
        });
        this.setState({showIndicator: false})
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
                <View style = {{width: 50, height: '100%', justifyContent: 'center', alignItems: 'center'}}>
                    <TouchableOpacity onPress = {() => this.go_home()}>
                        <Image style = {{width: 20, height: 20}} resizeMode = {'contain'} source={require('../../assets/images/menu_back_arrow.png')}/>
                    </TouchableOpacity>
                </View>
                <View style = {[this.state.search_view_bool ? {width: 100, } : {width: deviceWidth - 50 - 50 - 40}, {height: '100%', justifyContent: 'center'}]}>
                    <Text style = {styles.title_text}>EpatientIndex</Text>
                </View>
            {
                this.state.search_view_bool &&
                <View style = {{width: deviceWidth - 50 - 100 - 50 - 40, height: '100%', justifyContent: 'center', alignItems: 'center'}}>
                    <TextInput style = {{width: '100%', height: 35, fontSize: 18, color: '#000000', backgroundColor: '#ffffff'}} returnKeyType='search' onSubmitEditing={this.searchSubmit}>{this.state.search_text}</TextInput>
                </View>
            }
                <View style = {{width: 50, height: '100%', justifyContent: 'center', alignItems: 'center'}}>
                    <TouchableOpacity onPress = {() => this.chat_search()}>
                        <Image style = {{width: 30, height: 30}} resizeMode = {'contain'} source={require('../../assets/images/chat_search.png')}/>
                    </TouchableOpacity>
                </View>
                <View style = {{width: 40, height: '100%', justifyContent: 'center', alignItems: 'center'}}>
                    <TouchableOpacity onPress = {() => this.setState({show_right_menu_view: !this.state.show_right_menu_view})}>
                        <Image style = {{width: 30, height: 30}} resizeMode = {'contain'} source={require('../../assets/images/menu_right.png')}/>
                    </TouchableOpacity>
                </View>
            </View>
        {
            this.state.show_right_menu_view &&
            <View style = {styles.right_menu_view}>
                <TouchableOpacity style = {styles.right_menu_button} onPress = {() => this.chat_request_action()}>
                    <Text style = {styles.right_menu_button_text}>Send Friend Request</Text>
                </TouchableOpacity>
                <TouchableOpacity style = {styles.right_menu_button} onPress = {() => this.chat_profile_action()}>
                    <Text style = {styles.right_menu_button_text}>My Chat Profile</Text>
                </TouchableOpacity>
            </View>
        }
        {
            this.state.show_chat_request_view &&
            <View style = {{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black', opacity: 0.3, zIndex: 10}}>

            </View>
        }
        {
            this.state.show_chat_request_view &&
            <View style = {{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: 100}}>
                <View style = {styles.chat_request_view}>
                    <View style = {styles.chat_request_title_view}>
                        <Text style = {styles.chat_request_title_text}>Enter Friend Login Id</Text>
                    </View>
                    <View style = {styles.chat_request_id_view}>
                        <TextInput style = {styles.id_text_input} onChangeText = {(text) => this.setState({chat_request_id: text})}>{this.state.chat_request_id}</TextInput>
                    </View>
                    <View style = {styles.chat_request_button_view}>
                        <TouchableOpacity style = {styles.chat_request_button} onPress = {() => this.chat_request_button_action("cancel")}>
                            <Text style = {styles.chat_request_button_text}>CANCEL</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style = {styles.chat_request_button} onPress = {() => this.chat_request_button_action("ok")}>
                            <Text style = {styles.chat_request_button_text}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        }
            <View style = {styles.tabbar_view}>
                <TouchableOpacity style = {[styles.tabbar_item_view, this.state.selected_chat_tab == "group" ? {borderBottomColor: '#4caf50'}: {}]} onPress = {() => this.select_chattab("group")}>
                    <Image style = {styles.tab_icon} resizeMode = {'contain'} source={require('../../assets/images/chat_group.png')}/>
                </TouchableOpacity>
                <TouchableOpacity style = {[styles.tabbar_item_view, this.state.selected_chat_tab == "recent" ? {borderBottomColor: '#4caf50'}: {}]} onPress = {() => this.select_chattab("recent")}>
                    <Image style = {styles.tab_icon} resizeMode = {'contain'} source={require('../../assets/images/chat_private.png')}/>
                </TouchableOpacity>
                {/* <TouchableOpacity style = {[styles.tabbar_item_view, this.state.selected_chat_tab == "private" ? {borderBottomColor: '#4caf50'}: {}]} onPress = {() => this.select_chattab("private")}>
                    <Image style = {styles.tab_icon} resizeMode = {'contain'} source={require('../../assets/images/chat_private.png')}/>
                </TouchableOpacity> */}
                <TouchableOpacity style = {[styles.tabbar_item_view, this.state.selected_chat_tab == "add" ? {borderBottomColor: '#4caf50'}: {}]} onPress = {() => this.select_chattab("add")}>
                    <Image style = {styles.tab_icon} resizeMode = {'contain'} source={require('../../assets/images/chat_add_user.png')}/>
                </TouchableOpacity>
            </View>
            <View style = {{width: '95%', height: main_view_height}}>
            {
                this.state.selected_chat_tab == "group" &&
                <ScrollView style = {{width: '100%'}}>
                {
                    this.state.diagnose_list.map((item, index) => 
                    <TouchableOpacity key = {index} style = {styles.user_item_style} onPress = {() => this.props.navigation.navigate("ChatScreen", {chat_type: 'group', disease: item})}>
                        <Text style = {styles.user_name_text} numberOfLines = {1} renderTruncatedFooter = {() => null}>{item.diagnoseDesc}</Text>
                    </TouchableOpacity>
                    )
                }
                </ScrollView>
            }
            {
                this.state.selected_chat_tab == "recent" &&
                <ScrollView style = {{width: '100%'}}>
                {
                    this.state.chat_recent_list.map((item, index) => 
                    <TouchableOpacity style = {styles.recent_chat_item_view} onPress = {() => this.props.navigation.navigate("ChatScreen", {chat_type: 'recent', client: item})}>
                        <View style = {styles.recent_chat_avatar_view}>
                        {
                            item.avatar_url == "" &&
                            <Image style = {{width: "70%", height: "70%"}} resizeMode = {'cover'} source={require('../../assets/images/avatar_empty.png')}/>
                        }
                        {
                            item.avatar_url != "" &&
                            <Image style = {{width: "70%", height: "70%", borderRadius:56}} resizeMode = {'cover'} source={{uri: item.avatar_url}}/>
                        }
                        </View>
                        <View style = {styles.recent_chat_content_view}>
                            <View style = {{width: '100%', height: '60%', justifyContent: 'center'}}>
                                <Text style = {styles.user_name_text}>{item.userContact}</Text>
                            </View>
                            <View style = {{width: '100%', height: '40%', justifyContent: 'center'}}>
                                <Text style = {[{fontSize: 16}, item.status == 'online' ? {color: '#808080'} : {color: '#ff0000'}]}>{item.status}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                    )
                }
                </ScrollView>
            }
            {/* {
                this.state.selected_chat_tab == "private" &&
                <ScrollView style = {{width: '100%'}}>
                {
                    this.state.diagnose_list.map((item, index) => 
                    <TouchableOpacity key = {index} style = {styles.user_item_style} onPress = {() => this.props.navigation.navigate("ChatScreen", {disease: item})}>
                        <Text style = {styles.user_name_text} numberOfLines = {1} renderTruncatedFooter = {() => null}>{item.diagnoseDesc}</Text>
                    </TouchableOpacity>
                    )
                }
                </ScrollView>
            } */}
            {
                this.state.selected_chat_tab == "add" &&
                <ScrollView style = {{width: '100%'}}>
                {
                    this.state.chat_request_list.map((item, index) => 
                    <View style = {styles.chat_request_item_view}>
                        <View style = {styles.client_avatar_view}>
                        {
                            item.avatar_url == "" &&
                            <Image style = {{width: "70%", height: "70%"}} resizeMode = {'cover'} source={require('../../assets/images/avatar_empty.png')}/>
                        }
                        {
                            item.avatar_url != "" &&
                            <Image style = {{width: "70%", height: "70%", borderRadius: 56}} resizeMode = {'cover'} source={{uri: item.avatar_url}}/>
                        }   
                        </View>
                        <View style = {styles.client_info_view}>
                            <View style = {{width: '100%', height: '50%', justifyContent: 'center'}}>
                                <Text style = {styles.user_name_text}>{item.userContact}</Text>
                            </View>
                            {/* <View style = {{width: '100%', height: '25%', alignItems: 'center', flexDirection: 'row'}}>
                                <Image style = {{height: 16, width: 16}} resizeMode = {'contain'} source={require('../../assets/images/map_marker.png')}/>
                                <Text style = {styles.request_address_text}>{item.address}</Text>
                            </View> */}
                            <View style = {{width: '100%', height: '50%', justifyContent: 'space-around', alignItems: 'center', flexDirection: 'row'}}>
                                <TouchableOpacity style = {[styles.request_accept_button, {backgroundColor: '#00acc0'}]} onPress = {() => this.request_accept("accept", index)}>
                                    <Text style = {{fontSize: 15, color: '#ffffff'}}>Accept</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style = {styles.request_accept_button} onPress = {() => this.request_accept("reject", index)}>
                                    <Text style = {{fontSize: 15, color: '#000000'}}>Reject</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    )
                }
                </ScrollView>
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
        alignItems: 'center'
    },
    title_text: {
        fontSize: 18, 
        color: '#ffffff'
    },
    menu_bar: {
        width: '100%',
        height: menu_bar_height,
        backgroundColor: '#445774',
        flexDirection: 'row'
    },
    right_menu_view: {
        width: 200,
        height: 80,
        position: 'absolute',
        zIndex: 10,
        top: menu_bar_height + getInset('top'),
        right: 0,
        backgroundColor: '#ffffff'
    },
    right_menu_button: {
        width: '100%',
        height: '50%',
        justifyContent: 'center',
        paddingLeft: 10
    },
    right_menu_button_text: {
        fontSize: 16,
        color: '#000000'
    },
    chat_request_view: {
        width: '90%',
        height: 150,
        backgroundColor: '#ffffff'
    },
    chat_request_title_view: {
        width: '100%',
        height: 50,
        justifyContent: 'center',
        paddingLeft: 10
    },
    chat_request_title_text: {
        fontSize: 18,
        color: '#000000'
    },
    chat_request_id_view: {
        width: '100%',
        height: 40,
        alignItems: 'center'
    },
    id_text_input: {
        width: '95%',
        height: '70%',
        padding: 0,
        borderBottomWidth: 2,
        borderBottomColor: '#e4b79a',
        fontSize: 16,
        color: '#000000'
    },
    chat_request_button_view: {
        width: '100%',
        height: 60,
        justifyContent: 'flex-end',
        alignItems: 'center',
        flexDirection: 'row'
    },
    chat_request_button: {
        width: 80,
        height: '80%',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    chat_request_button_text: {
        fontSize: 16,
        color: '#e4b79a'
    },
    tabbar_view: {
        width: '100%',
        height: tabbar_height,
        flexDirection: 'row'
    },
    tabbar_item_view: {
        width: '34%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#445774',
        borderBottomWidth: 2
    },
    tab_icon: {
        width: 20,
        height: 20
    },
    user_item_style: {
        width: '100%',
        height: 50,
        // borderColor: '#c0c0c0',
        // borderWidth: 1,
        justifyContent: 'center',
        marginTop: 10,
        // borderRadius: 5,
        paddingLeft: 10
    },
    user_name_text: {
        fontSize: 18,
        color: '#000000'
    },

    recent_chat_item_view: {
        width: '100%',
        height: 60,
        flexDirection: 'row'
    },
    recent_chat_avatar_view: {
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center'
    },
    recent_chat_status_text: {
        fontSize: 16,
        color: '#404040'
    },

    chat_request_item_view: {
        width: '100%',
        height: 80,
        flexDirection: 'row'
    },
    client_avatar_view: {
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center'
    },
    client_info_view: {
        width: deviceWidth * 0.95 - 80,
        height: 80,
    },
    request_address_text: {
        fontSize: 15,
        color: '#808080',
        marginLeft: 5
    },
    request_accept_button: {
        width: '40%',
        height: '90%',
        borderRadius: 5,
        borderColor: '#00acc0',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        
    }
})