package com.onlikee.module.application.mapper;

import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import com.onlikee.module.application.model.entity.ApplicationCollectEntity;
import com.onlikee.module.application.model.entity.ApplicationConnectEntity;
import com.onlikee.module.application.model.entity.ApplicationNewEntity;

@Mapper
public interface ApplicationCreateMapper {

    @Select("""
            select count(1)
            from application_new
            where app_subdomain = #{appSubDomain}
            """)
    int countNewByAppSubDomain(@Param("appSubDomain") String appSubDomain);

    @Insert("""
            insert into application_new
            (appid, owner_uuid, framework, app_name, app_subdomain,
             visibility, app_description, original_filename,
             original_file_type, original_file_size)
            values
            (#{appid}, #{ownerUuid}, #{framework}, #{appName}, #{appSubDomain},
             #{visibility}, #{appDescription}, #{originalFilename},
             #{originalFileType}, #{originalFileSize})
            """)
    int insertApplicationNew(ApplicationNewEntity application);

    @Select("""
            select count(1)
            from application_connect
            where app_url = #{appUrl}
            """)
    int countConnectByAppUrl(@Param("appUrl") String appUrl);

    @Insert("""
            insert into application_connect
            (appid, owner_uuid, app_name, app_url, visibility, app_description)
            values
            (#{appid}, #{ownerUuid}, #{appName}, #{appUrl}, #{visibility}, #{appDescription})
            """)
    int insertApplicationConnect(ApplicationConnectEntity application);

    @Select("""
            select count(1)
            from application_collect
            where app_url = #{appUrl}
            """)
    int countCollectByAppUrl(@Param("appUrl") String appUrl);

    @Insert("""
            insert into application_collect
            (appid, owner_uuid, app_name, app_url, visibility, app_description)
            values
            (#{appid}, #{ownerUuid}, #{appName}, #{appUrl}, #{visibility}, #{appDescription})
            """)
    int insertApplicationCollect(ApplicationCollectEntity application);
}
