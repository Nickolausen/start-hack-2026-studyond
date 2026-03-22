#include "kernel/AsyncFSM.hpp"

// #define DEBUG

AsyncFSM::AsyncFSM(Lcd *lcd, Pot *pot, Valve *valve)
    : state(new StateHolder<SystemState>(UNCONNECTED)),
    lcd(lcd),
    potentiometer(pot),
    valve(valve)
{
    displayState();
}

// Pay attention! 
// It uses Serial, so be sure not to need it to send messages to other systems! 
void log(String msg) { Serial.println(msg); }

void AsyncFSM::handleSerialEvt(SerialEvent *serialEvt)
{
    Msg *receivedMsg = serialEvt->getValue();
    MsgTopic msgTopic = receivedMsg->getTopic();
    switch (msgTopic)
    {
    case MsgTopic::MODE: 
    {
        // new mode received from CUS,
        // decoding which mode was received
        if (receivedMsg->getContent().equals("MANUAL"))
        {
            this->state->setState(SystemState::MANUAL);
            // nothing else to do

        } else if (receivedMsg->getContent().equals("UNCONNECTED"))
        {
            this->state->setState(SystemState::UNCONNECTED);
            // nothing else to do   
        } 
        else if (receivedMsg->getContent().equals("AUTOMATIC"))
        {
            // AUTOMATIC mode received
            this->state->setState(SystemState::AUTOMATIC);
        } 
        else 
        {
            #ifdef DEBUG
            log("unexpected mode received!");
            #endif
        }
        displayState();
        break;
    }
    case MsgTopic::VALVE: 
    {
        // we received something about the valve
        // assuming the opening value arrives already in percentage between [0.0, 1.0]
        this->valve->setOpening(receivedMsg->getContent().toFloat());
        break;
    }
    default: 
    {
        #ifdef DEBUG
        log("Unexpected msg topic received!");
        #endif
        break;
    }
    }
}

void AsyncFSM::handleButtonEvt(ButtonEvent *buttonEvt)
{
    SystemState currentSystemState = this->state->getState();
    SystemState newState = currentSystemState;
    switch (currentSystemState)
    {
        case SystemState::UNCONNECTED:
        {
            /* do nothing */
            break;
        }
        case SystemState::AUTOMATIC:
        {
            newState = SystemState::MANUAL;
            break;
        }
        case SystemState::MANUAL:
        {
            newState = SystemState::AUTOMATIC;
            break;
        }
    }

    this->state->setState(newState);
    String newStateStr = "UNCONNECTED";
    if (newState == SystemState::AUTOMATIC) { newStateStr = "AUTOMATIC"; }
    else if (newState == SystemState::MANUAL) { newStateStr = "MANUAL"; }
    msgService.sendMsg("MODE:" + newStateStr);
    displayState();
}

void AsyncFSM::handlePotEvt(PotEvent *potEvt)
{
    SystemState currentSystemState = this->state->getState();
    if (currentSystemState != SystemState::MANUAL) { return; }

    float percentage = (float)(potEvt->getValue() - POT_MIN) / (POT_MAX - POT_MIN);
    valve->setOpening(percentage);
    msgService.sendMsg("VALVE:" + String(percentage));
}

void AsyncFSM::checkAndProcessEvent()
{
    noInterrupts();
    bool isEmpty = sharedQueue.isEmpty();
    interrupts();

    // Exit early if no events occurred
    if (isEmpty) { return; }
    
    noInterrupts();
    IEvent *evt = sharedQueue.dequeue();
    interrupts();

    switch (evt->getType())
    {
    case EventType::SERIAL_EVT: 
    {
        SerialEvent *serialEvt = static_cast<SerialEvent *>(evt);
        #ifdef DEBUG
        log("serial event!");
        #endif
        handleSerialEvt(serialEvt);
        delete serialEvt;
        break;
    }
    case EventType::BUTTON_EVT:
    {
        ButtonEvent *buttonEvt = static_cast<ButtonEvent *>(evt);
        #ifdef DEBUG
        log("button event!");
        #endif
        handleButtonEvt(buttonEvt);
        delete buttonEvt;
        break;
    }
    case EventType::POT_EVT: 
    {
        PotEvent *potEvt = static_cast<PotEvent *>(evt);
        #ifdef DEBUG
        log("pot event!");
        #endif
        handlePotEvt(potEvt);
        delete potEvt;
        break;
    }
    default:
        #ifdef DEBUG
        log("unexpected event received!");
        #endif
        break;
    }
}

void AsyncFSM::displayState()
{
    String msg = "UNCONNECTED";
    switch (state->getState())
    {
        case SystemState::AUTOMATIC: { msg = "AUTOMATIC"; break; }
        case SystemState::MANUAL: { msg = "MANUAL"; break; }
        default: break;
    }
    lcd->print(msg);
    #ifdef DEBUG
    log(msg);
    #endif
}