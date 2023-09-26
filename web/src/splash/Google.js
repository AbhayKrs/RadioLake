import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useNavigate } from "react-router-dom";
import { useEffect } from 'react';
// import { handleVerifyUser } from '../../store/actions/common.actions';

const Google = (props) => {
    let navigate = useNavigate();

    useEffect(() => {
        const params = new Proxy(new URLSearchParams(window.location.search), {
            get: (searchParams, prop) => searchParams.get(prop),
        });
        if (params.auth) {
            // props.handleVerifyUser(params.auth);
            localStorage.setItem('jwtToken', params.auth)
            navigate('/')
        }
    }, [])

    return (
        <div style={{ height: '100vh', width: '100vw' }}>
            <h1>{props.header}!</h1>
        </div>
    )
}

// const mapStateToProps = (state, props) => ({
//     common: state.common
// })

// const mapDispatchToProps = (dispatch) => bindActionCreators({
//     handleVerifyUser
// }, dispatch);

// export default connect(mapStateToProps, mapDispatchToProps)(Google);

export default Google;