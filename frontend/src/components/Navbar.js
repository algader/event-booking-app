import React from "react";
import { NavLink } from "react-router-dom";

export default function MainNavigation() {
    return ( 
        <nav className="navbar navbar-expand-md navbar-light main-navigation"> 
            <div className="container-fluid">
              <NavLink to="/events" className="navbar-brand"> 
                <h1> مناسبات حسوب </h1>
              </NavLink>
             <button className="navbar-toggler" type="button" data-bs-toggle="collapse" 
             data-bs-target="#navbarNav" aria-controls="navbarNav"
              aria-expanded="false" aria-label="Toggle navigation"> 
                <span className="navbar-toggler-icon"></span> 
            </button> 
            <div className="collapse navbar-collapse main-navigation-items" id="navbarNav">
                <ul className="navbar-nav">
                  <li className="nav-item">
                    <NavLink to="/events" className="nav-link">المناسبات</NavLink>
                  </li>
                  <li className="nav-item"> 
                    <NavLink to="/bookings" className="nav-link">حجوزاتي</NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink to="/login" className="nav-link">تسجيل الدخول</NavLink>
                  </li>
                </ul>
            </div>
            </div>
        </nav>

    );
}       
