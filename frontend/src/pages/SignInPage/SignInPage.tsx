import React, {useEffect} from "react";
import {Button, Flex, Heading, Text, TextInput, View} from "@instructure/ui";
import {Form, useNavigate} from "react-router-dom";
import {useForm} from "react-hook-form";
import {useAuth} from "../../api/useAuth";

type Props = {};

export default function SignInPage({}: Props) {

    const {login, isAuthenticated, authError} = useAuth();
    const navigate = useNavigate();

    const {register, handleSubmit} = useForm()

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/')
        }
    }, [isAuthenticated]);

    const onSubmit = handleSubmit(async (data) => {
        await login(data.pin);
    });

    return (
        <View as="div">
            <Flex width="100%" height="100vh" alignItems="center" justifyItems="center">
                <View as="div" borderWidth="small" borderRadius="large" padding="x-large">
                    <Form onSubmit={onSubmit}>
                        <Heading level="h3" margin="0 0 large 0">
                            HappiPlant
                        </Heading>

                        <TextInput
                            {...register('pin')}
                            textAlign="end"
                            renderBeforeInput={<Text>PIN</Text>}
                        />

                        <Button type="submit" color="primary" display="block" margin="small 0 0 0">
                            Login
                        </Button>

                        {authError && (
                            <View as="div" margin="small 0 0 0">
                                <Text color="warning">{authError}</Text>
                            </View>
                        )}
                    </Form>
                </View>
            </Flex>
        </View>
    );
}