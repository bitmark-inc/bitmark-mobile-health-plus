import { Dimensions } from 'react-native';
let currentSize = Dimensions.get('window');
let widthDesign = 375;

const convertWidth = (width) => {
  return width * currentSize.width / widthDesign;
};

const sortList = (list, compare) => {
  for (let index = 0; index < list.length; index++) {
    for (let tempIndex = index + 1; tempIndex < list.length; tempIndex++) {
      if (compare(list[index], list[tempIndex]) > 0) {
        let temp = list[index];
        list[index] = list[tempIndex];
        list[tempIndex] = temp;
      }
    }
  }
  return list;
};

export { convertWidth, sortList };