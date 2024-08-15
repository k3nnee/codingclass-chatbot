"use client"

import {useState} from "react";
import {Box, Stack, Button, TextField, Typography, Toolbar, AppBar} from "@mui/material";

export default function Home() {
  const [messages, setMessages] = useState([{
    role : "assistant",
    content: "Welcome back to CoderClass, lets get learning!"
  }]);

  const [message, setMessage] = useState("");

  const sendMessage = async () => {
      setMessages((messages) => [...messages,
          {role: "user", content: message},
          {role: "assistant", content: ""}
      ]);
      setMessage("");

      const response = fetch("/api/chat", {
          method : "POST",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify([...messages, {role: "user", content: message}])
      }).then(async (res) => {
          const reader = res.body.getReader();
          const decoder = new TextDecoder();

          let result = "";
          return reader.read().then(function processText({done, value}) {
              if (done) {
                  return result;
              }
              const text = decoder.decode(value || new Int8Array(), {stream: true});
              setMessages((messages) => {
                  let lastMessage = messages[messages.length - 1];
                  let otherMessages = messages.slice(0, messages.length - 1)
                  return [
                      ...otherMessages,
                      {
                          ...lastMessage,
                          content: lastMessage.content + text
                      }]
              })
              return reader.read().then(processText)
          })
      })
      console.log(messages);
  }

  return (
      <>
          <Box display = "flex" justifyContent = "start" bgcolor = "primary.main" py = "8px" px = {5} color = "white">
              <Typography variant = "h6"> CoderClass </Typography>
          </Box>
          <Box width = "100%"
               height = "100%"
               display = "flex"
               flexDirection = "column"
               justifyContent = "center"
               alignItems = "center"
               my = {2}>
              <Box width = "500px"
                   height = "700px"
                   border = "1px solid black"
                   borderRadius = {10}
                   py = {2}
                   px = {2}
                   bgcolor = "black">
                  <Stack direction = "column"
                         width = "100%"
                         height = "665px"
                         borderRadius = {5}
                         spacing = {3}
                         p = {1}
                         bgcolor = "white">
                      <Stack direction = "column"
                             spacing = {2}
                             flexGrow = {1}
                             overflow = "auto"
                             maxHeight = "100%">
                          {
                              messages.map((message, index) => (
                                  <Box key = {index} display = "flex" justifyContent = {
                                      message.role == "assistant" ? "flex-start" : "flex-end"
                                  }>
                                      <Box bgcolor = {
                                          message.role == "assistant" ? "primary.main" : "lightgrey"
                                      }
                                           color = "white" borderRadius = {16} p = {3}> {message.content} </Box>
                                  </Box>
                              ))
                          }
                      </Stack>
                      <Stack direction = "row" spacing = {1} width = "100%">
                          <TextField label = "message" fullWidth value = {message} onChange = {(e) => setMessage(e.target.value)}></TextField>
                          <Button variant = "contained" onClick = {sendMessage}> SEND </Button>
                      </Stack>
                  </Stack>
              </Box>
          </Box>
      </>
  )
}
