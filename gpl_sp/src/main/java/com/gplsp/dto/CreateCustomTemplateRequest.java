package com.gplsp.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateCustomTemplateRequest {
    private String documentTypeCode;
    private String name;
    private String reportName;
}
