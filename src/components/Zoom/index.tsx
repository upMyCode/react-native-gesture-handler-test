import React, {useState, useCallback, useRef} from 'react';
import {
  Image,
  SafeAreaView,
  StyleSheet,
  useWindowDimensions,
  Animated,
  PanResponder,
} from 'react-native';
import {
  TapGestureHandler,
  GestureHandlerRootView,
  PinchGestureHandler,
  PanGestureHandler,
  State,
} from 'react-native-gesture-handler';
const imageUri =
  'https://images.unsplash.com/photo-1621569642780-4864752e847e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=668&q=80';

function Zoom(): JSX.Element {
  const [isZoomedIn, setIsZoomedIn] = useState(false);

  const lastScale = useRef(1);
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const baseScale = useRef(new Animated.Value(lastScale.current)).current;
  const pinchScale = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.multiply(baseScale, pinchScale)).current;
  const lastOffset = useRef({
    x: 0,
    y: 0,
  }).current;

  const zoomIn = useCallback(() => {
    lastScale.current = 1.5;
    Animated.parallel([
      Animated.spring(baseScale, {
        toValue: lastScale.current,
        useNativeDriver: true,
      }),
      Animated.spring(pinchScale, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();

    lastOffset.x = 0;
    lastOffset.y = 0;

    translateX.setOffset(lastOffset.x);
    translateX.setValue(0);

    translateY.setOffset(lastOffset.y);
    translateY.setValue(0);

    setIsZoomedIn(true);
  }, [baseScale, pinchScale, lastOffset, translateX, translateY]);

  const zoomOut = useCallback(() => {
    lastScale.current = 1;

    Animated.parallel([
      Animated.spring(baseScale, {
        toValue: lastScale.current,
        useNativeDriver: true,
      }),
      Animated.spring(pinchScale, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();

    lastOffset.x = 0;
    lastOffset.y = 0;

    translateX.setOffset(lastOffset.x);
    translateX.setValue(0);

    translateY.setOffset(lastOffset.y);
    translateY.setValue(0);

    setIsZoomedIn(false);
  }, [lastOffset, translateX, translateY]);

  const {width: deviceWidth} = useWindowDimensions();

  const renderImage = ({scale, translateX, translateY}) => {
    return (
      <Animated.Image
        source={{uri: imageUri}}
        style={[
          {width: deviceWidth, height: 500},
          {transform: [{scale}, {translateX}, {translateY}]},
        ]}
      />
    );
  };

  const onDoubleTap = useCallback(
    e => {
      console.log('DoubleTaps', e.nativeEvent.state);
      if (e.nativeEvent.state !== State.ACTIVE) {
        return;
      }

      if (isZoomedIn) {
        zoomOut();
      } else {
        zoomIn();
      }
    },
    [isZoomedIn, zoomOut, zoomIn],
  );

  const onPanHandlerStateChange = useCallback(
    e => {
      if (e.nativeEvent.oldState === State.ACTIVE) {
        lastOffset.x += e.nativeEvent.translationX;
        lastOffset.y += e.nativeEvent.translationY;
      }
    },
    [lastOffset],
  );

  const onPinchHandler = useCallback(
    e => {
      if (e.nativeEvent.oldState === State.ACTIVE) {
        lastScale.current *= e.nativeEvent.scale;

        if (lastScale.current > 1) {
          setIsZoomedIn(true);
          baseScale.setValue(lastScale.current);
          pinchScale.setValue(1);
        } else {
          zoomOut();
        }
      }
    },
    [lastScale, baseScale, pinchScale, zoomOut],
  );

  const onPinchGestureEvent = Animated.event(
    [{nativeEvent: {scale: pinchScale}}],
    {useNativeDriver: true},
  );

  const onPanGestureEvent = Animated.event(
    [
      {
        nativeEvent: {
          translationX: translateX,
          translationY: translateY,
        },
      },
    ],
    {useNativeDriver: true},
  );

  return (
    <GestureHandlerRootView>
      <TapGestureHandler onHandlerStateChange={onDoubleTap} numberOfTaps={2}>
        <Animated.View style={{flex: 1}}>
          <PanGestureHandler
            onHandlerStateChange={onPanHandlerStateChange}
            onGestureEvent={onPanGestureEvent}>
            <Animated.View>
              <PinchGestureHandler
                minPointer={2}
                maxPointer={2}
                onGestureEvent={onPinchGestureEvent}
                onHandlerStateChange={onPinchHandler}>
                {renderImage({scale, translateX, translateY})}
              </PinchGestureHandler>
            </Animated.View>
          </PanGestureHandler>
        </Animated.View>
      </TapGestureHandler>
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
export default Zoom;
