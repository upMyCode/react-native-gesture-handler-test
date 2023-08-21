import React from 'react';
import {Image, StyleSheet} from 'react-native';
import {
  GestureHandlerRootView,
  PinchGestureHandler,
  PinchGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const imageUri =
  'https://images.unsplash.com/photo-1621569642780-4864752e847e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=668&q=80';

const AnimatedImage = Animated.createAnimatedComponent(Image);

function Pinch(): JSX.Element {
  const scale = useSharedValue(1);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);

  const pinchHandler =
    useAnimatedGestureHandler<PinchGestureHandlerGestureEvent>({
      onActive: event => {
        scale.value = event.scale;
        focalX.value = event.focalX;
        focalY.value = event.focalY;
      },
      onEnd: event => {
        scale.value = withTiming(1);
      },
    });

  const rStyle = useAnimatedStyle(() => {
    return {
      transform: [{scale: scale.value}],
    };
  });

  const focalPointStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateX: focalX.value}, {translateY: focalY.value}],
    };
  });
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <PinchGestureHandler onGestureEvent={pinchHandler}>
        <Animated.View style={{flex: 1}}>
          <AnimatedImage source={{uri: imageUri}} style={[{flex: 1}, rStyle]} />
          <Animated.View style={[styles.focalPoint, focalPointStyle]} />
        </Animated.View>
      </PinchGestureHandler>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  focalPoint: {
    ...StyleSheet.absoluteFillObject,
    width: 20,
    height: 20,
    backgroundColor: 'blue',
    borderRadius: 10,
  },
});
export default Pinch;
