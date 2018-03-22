import React from 'react';
import PropTypes from 'prop-types';
import {
  Text, View, FlatList, TouchableOpacity, ScrollView, ActivityIndicator,
} from 'react-native';

import taskStyles from './task.component.style';
import { DataController } from '../../../../managers';
import { EventEmiterService } from '../../../../services';

const TaskTypes = {
  todo: 'To Do',
  completed: 'Completed',
}

export class TasksComponent extends React.Component {
  constructor(props) {
    super(props);
    this.handerDonationInformationChange = this.handerDonationInformationChange.bind(this);

    let donationInformation = DataController.getDonationInformation();
    let type = (this.props.type && (this.props.type === TaskTypes.todo || this.props.type === TaskTypes.completed)) ? this.props.type : TaskTypes.todo;
    this.state = {
      todoTasks: donationInformation.todoTasks || [],
      totalTodoTask: donationInformation.totalTodoTask,
      completedTasks: donationInformation.completedTasks,
      type,
    }
  }
  // ==========================================================================================
  componentDidMount() {
    EventEmiterService.on(EventEmiterService.events.CHANGE_USER_DATA_DONATION_INFORMATION, this.handerDonationInformationChange);
  }
  componentWillUnmount() {
    EventEmiterService.remove(EventEmiterService.events.CHANGE_USER_DATA_DONATION_INFORMATION, this.handerDonationInformationChange);
  }
  // ==========================================================================================
  handerDonationInformationChange() {
    let donationInformation = DataController.getDonationInformation();
    this.setState({
      todoTasks: donationInformation.todoTasks || [],
      totalTodoTask: donationInformation.totalTodoTask,
      completedTasks: donationInformation.completedTasks,
    });
  }

  switchType(type) {
    let donationInformation = DataController.getDonationInformation();
    this.setState({
      type,
      todoTasks: donationInformation.todoTasks || [],
      totalTodoTask: donationInformation.totalTodoTask,
      completedTasks: donationInformation.completedTasks,
    });
  }

  render() {
    return (
      <View style={[taskStyles.body]}>
        <View style={taskStyles.subTabArea}>
          {this.state.type === TaskTypes.todo && <TouchableOpacity style={[taskStyles.subTabButton, {
            shadowOffset: { width: 2 },
            shadowOpacity: 0.15,
          }]}>
            <View style={taskStyles.subTabButtonArea}>
              <View style={[taskStyles.activeSubTabBar, { backgroundColor: '#0060F2' }]}></View>
              <View style={taskStyles.subTabButtonTextArea}>
                <Text style={taskStyles.subTabButtonText}>{TaskTypes.todo.toUpperCase()} ({this.state.totalTodoTask})</Text>
              </View>
            </View>
          </TouchableOpacity>}
          {this.state.type !== TaskTypes.todo && <TouchableOpacity style={[taskStyles.subTabButton, {
            backgroundColor: '#F5F5F5',
            zIndex: 0,
          }]} onPress={() => this.switchType(TaskTypes.todo)}>
            <View style={taskStyles.subTabButtonArea}>
              <View style={[taskStyles.activeSubTabBar, { backgroundColor: '#F5F5F5' }]}></View>
              <View style={taskStyles.subTabButtonTextArea}>
                <Text style={[taskStyles.subTabButtonText, { color: '#C1C1C1' }]}>{TaskTypes.todo.toUpperCase()} ({this.state.totalTodoTask})</Text>
              </View>
            </View>
          </TouchableOpacity>}

          {this.state.type === TaskTypes.completed && <TouchableOpacity style={[taskStyles.subTabButton, {
            shadowOffset: { width: -2 },
            shadowOpacity: 0.15,
          }]}>
            <View style={taskStyles.subTabButtonArea}>
              <View style={[taskStyles.activeSubTabBar, { backgroundColor: '#0060F2' }]}></View>
              <View style={taskStyles.subTabButtonTextArea}>
                <Text style={taskStyles.subTabButtonText}>{TaskTypes.completed.toUpperCase()} ({this.state.completedTasks.length})</Text>
              </View>
            </View>
          </TouchableOpacity>}
          {this.state.type !== TaskTypes.completed && <TouchableOpacity style={[taskStyles.subTabButton, {
            backgroundColor: '#F5F5F5',
            zIndex: 0,
          }]} onPress={() => this.switchType(TaskTypes.completed)}>
            <View style={taskStyles.subTabButtonArea}>
              <View style={[taskStyles.activeSubTabBar, { backgroundColor: '#F5F5F5' }]}></View>
              <View style={taskStyles.subTabButtonTextArea}>
                <Text style={[taskStyles.subTabButtonText, { color: '#C1C1C1' }]}>{TaskTypes.completed.toUpperCase()} ({this.state.completedTasks.length})</Text>
              </View>
            </View>
          </TouchableOpacity>}
        </View>

        <ScrollView style={taskStyles.contentArea}>
          <FlatList data={this.state.type === TaskTypes.todo ? this.state.todoTasks : this.state.completedTasks}
            extraData={this.state}
            scrollEnabled={false}
            renderItem={({ item }) => {
              return (
                <TouchableOpacity style={[taskStyles.taskRow, {
                  borderLeftColor: this.state.type === TaskTypes.todo ?
                    (item.task === 'data-source-inactive' ? '#FF003C' : '#0060F2') : '#BDBDBD'
                }]} onPress={() => {
                  if (item.completedDate) {
                    this.props.onClickCompletedTask(item);
                  } else {
                    this.props.onClickTodoTask(item);
                  }
                }}>
                  <View style={taskStyles.taskRowLeft}></View>
                  <Text style={[taskStyles.taskTitle, {
                    color: this.state.type === TaskTypes.todo ?
                      (item.task === 'data-source-inactive' ? '#FF003C' : 'black') : '#828282'
                  }]} >
                    {item.title + (item.number > 1 ? (' (' + item.number + ')') : '')}
                  </Text>
                  <Text style={[taskStyles.taskRowDescription, { color: this.state.type === TaskTypes.todo ? 'black' : '#828282' }]}>{item.description}</Text>
                </TouchableOpacity>
              )
            }}
          />

          {this.state.type === TaskTypes.todo && this.state.todoTasks.length === 0 &&
            <View style={taskStyles.notTaskArea}>
              <Text style={taskStyles.noTaskMessage}>{'ThERE are no new tasks.'.toUpperCase()}</Text>
              <Text style={taskStyles.notTaskDescription}>It looks like you have nothing due today. This page will show what you need to do once you join a study or turn on data sources to bitmark.</Text>
            </View>
          }
        </ScrollView>
      </View>
    );
  }
}

TasksComponent.propTypes = {
  type: PropTypes.string,
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
  }),
  subTab: PropTypes.string,
  userInformation: PropTypes.object,
  onClickCompletedTask: PropTypes.func,
  onClickTodoTask: PropTypes.func,
};